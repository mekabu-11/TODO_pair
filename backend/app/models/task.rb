class Task < ApplicationRecord
  belongs_to :couple
  belongs_to :assignee, class_name: 'User', optional: true
  belongs_to :parent, class_name: 'Task', optional: true
  has_many :comments, dependent: :destroy
  has_many :subtasks, class_name: 'Task', foreign_key: 'parent_id', dependent: :destroy

  validates :title, presence: true

  CATEGORIES = %w[money procedure event health other].freeze
  validates :category, inclusion: { in: CATEGORIES, allow_nil: true }

  PRIORITIES = { low: 1, medium: 2, high: 3 }.freeze
  validates :priority, inclusion: { in: PRIORITIES.values, allow_nil: true }

  scope :incomplete, -> { where(completed_at: nil) }
  scope :completed, -> { where.not(completed_at: nil) }
  scope :by_due_date, -> { order(:due_date) }
  scope :by_priority, -> { order(priority: :desc) }

  def complete!
    update!(completed_at: Time.current)
  end

  def incomplete!
    update!(completed_at: nil)
  end

  def completed?
    completed_at.present?
  end
end
