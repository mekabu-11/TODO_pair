module Api
  class CommentsController < ApplicationController
    before_action :set_task, only: [:index, :create]
    before_action :set_comment, only: [:destroy]

    # GET /api/tasks/:task_id/comments
    def index
      comments = @task.comments.includes(:user)

      render json: comments.map { |comment| comment_response(comment) }
    end

    # POST /api/tasks/:task_id/comments
    def create
      @comment = @task.comments.build(comment_params)
      @comment.user = current_user

      if @comment.save
        render json: comment_response(@comment), status: :created
      else
        render json: { errors: @comment.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # DELETE /api/comments/:id
    def destroy
      @comment.destroy
      head :no_content
    end

    private

    def set_task
      @task = current_couple.tasks.find(params[:task_id])
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Task not found' }, status: :not_found
    end

    def set_comment
      @comment = Comment.joins(:task)
                        .where(tasks: { couple_id: current_couple.id })
                        .find(params[:id])
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Comment not found' }, status: :not_found
    end

    def comment_params
      params.permit(:content)
    end

    def comment_response(comment)
      {
        id: comment.id,
        content: comment.content,
        user: {
          id: comment.user.id,
          name: comment.user.name,
          color: comment.user.color
        },
        created_at: comment.created_at
      }
    end
  end
end
