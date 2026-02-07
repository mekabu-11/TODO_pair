class CreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users do |t|
      t.string :email, null: false
      t.string :name, null: false
      t.string :password_digest, null: false
      t.references :couple, foreign_key: true
      t.string :color

      t.timestamps
    end

    add_index :users, :email, unique: true
  end
end
