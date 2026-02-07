class User < ApplicationRecord
  has_secure_password

  belongs_to :couple, optional: true
  has_many :assigned_tasks, class_name: 'Task', foreign_key: 'assignee_id'
  has_many :comments, dependent: :destroy

  validates :email, presence: true, uniqueness: true
  validates :name, presence: true
  validates :color, inclusion: { in: %w[blue green], allow_nil: true }

  enum :color, { blue: 'blue', green: 'green' }, prefix: true
end
