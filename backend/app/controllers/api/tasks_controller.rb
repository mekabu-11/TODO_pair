module Api
  class TasksController < ApplicationController
    before_action :set_task, only: [:show, :update, :destroy, :complete]

    # GET /api/tasks
    def index
      tasks = current_couple.tasks
                            .where(parent_id: nil) # Only fetch top-level tasks
                            .includes(:assignee, :comments, :subtasks)
                            .order(created_at: :desc)

      # Filters
      tasks = tasks.where(category: params[:category]) if params[:category].present?
      tasks = tasks.where(assignee_id: params[:assignee_id]) if params[:assignee_id].present?
      
      if params[:status] == 'completed'
        tasks = tasks.completed
      elsif params[:status] == 'incomplete'
        tasks = tasks.incomplete
      end

      render json: tasks.map { |task| task_response(task, include_details: true) }
    end

    # GET /api/tasks/:id
    def show
      render json: task_response(@task, include_details: true)
    end

    # POST /api/tasks
    def create
      @task = current_couple.tasks.build(task_params)

      if @task.save
        render json: task_response(@task), status: :created
      else
        render json: { errors: @task.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # PATCH /api/tasks/:id
    def update
      if @task.update(task_params)
        render json: task_response(@task)
      else
        render json: { errors: @task.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # DELETE /api/tasks/:id
    def destroy
      @task.destroy
      head :no_content
    end

    # PATCH /api/tasks/:id/complete
    def complete
      if params[:completed] == false || params[:completed] == 'false'
        @task.incomplete!
      else
        @task.complete!
      end

      render json: task_response(@task)
    end

    private

    def set_task
      @task = current_couple.tasks.find(params[:id])
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Task not found' }, status: :not_found
    end

    def task_params
      params.permit(:title, :description, :category, :priority, :due_date, :assignee_id, :parent_id)
    end

    def task_response(task, include_details: false)
      response = {
        id: task.id,
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        due_date: task.due_date,
        completed: task.completed?,
        completed_at: task.completed_at,
        assignee: task.assignee ? { id: task.assignee.id, name: task.assignee.name, color: task.assignee.color } : nil,
        parent_id: task.parent_id,
        comments_count: task.comments.count,
        subtasks_count: task.subtasks.count,
        created_at: task.created_at,
        updated_at: task.updated_at
      }

      if include_details
        response[:comments] = task.comments.includes(:user).map do |comment|
          {
            id: comment.id,
            content: comment.content,
            user: { id: comment.user.id, name: comment.user.name, color: comment.user.color },
            created_at: comment.created_at
          }
        end

        response[:subtasks] = task.subtasks.order(:created_at).map do |subtask|
          task_response(subtask, include_details: false)
        end
      end

      response
    end
  end
end
