class CreateTasks < ActiveRecord::Migration[7.1]
  def change
    create_table :tasks do |t|
      t.references :couple, null: false, foreign_key: true
      t.references :assignee, foreign_key: { to_table: :users }
      t.string :title, null: false
      t.text :description
      t.string :category
      t.integer :priority
      t.date :due_date
      t.datetime :completed_at

      t.timestamps
    end

    add_index :tasks, [:couple_id, :completed_at]
    add_index :tasks, [:couple_id, :due_date]
  end
end
