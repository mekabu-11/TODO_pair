# Clear existing data
Comment.destroy_all
Task.destroy_all
User.destroy_all
Couple.destroy_all

puts "Existing data cleared."

# Create Couple
couple = Couple.create!
puts "Created Couple: #{couple.invite_code}"

# Create Users
user1 = User.create!(
  email: 'test1@example.com',
  name: 'Taro',
  password: 'password123',
  password_confirmation: 'password123',
  color: 'blue',
  couple: couple
)

user2 = User.create!(
  email: 'test2@example.com',
  name: 'Hanako',
  password: 'password123',
  password_confirmation: 'password123',
  color: 'green',
  couple: couple
)

puts "Created Users: #{user1.email}, #{user2.email}"

# Create Tasks
tasks = [
  { title: '新居の契約', description: '不動産屋に行く', category: 'procedure', priority: 3, due_date: Date.today + 7.days, assignee: user1 },
  { title: '引越し業者の見積もり', description: '3社くらい比較する', category: 'money', priority: 2, due_date: Date.today + 14.days, assignee: user2 },
  { title: '家具の購入', description: 'ソファとベッド', category: 'money', priority: 2, due_date: Date.today + 20.days, assignee: nil },
  { title: '役所の手続き', description: '転出届など', category: 'procedure', priority: 3, due_date: Date.today + 5.days, assignee: user1 },
  { title: '結婚式の打ち合わせ', description: 'プランナーと面談', category: 'event', priority: 3, due_date: Date.today + 30.days, assignee: user2 }
]

tasks.each do |t|
  Task.create!(
    title: t[:title],
    description: t[:description],
    category: t[:category],
    priority: t[:priority],
    due_date: t[:due_date],
    assignee: t[:assignee],
    couple: couple
  )
end

puts "Created #{tasks.count} tasks."

# Create Comments
task = Task.first
Comment.create!(content: '来週の土曜日に予約入れたよ', user: user1, task: task)
Comment.create!(content: 'ありがとう！', user: user2, task: task)

puts "Created comments."
