// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

print('Starting MongoDB initialization...');

// Switch to the application database
db = db.getSiblingDB(process.env.MONGO_DB_NAME || 'multimodel_chat');

// Create application user with read/write permissions
db.createUser({
  user: 'app_user',
  pwd: process.env.MONGO_APP_PASSWORD || 'app_password_change_me',
  roles: [
    {
      role: 'readWrite',
      db: process.env.MONGO_DB_NAME || 'multimodel_chat'
    }
  ]
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: 1 });

db.chats.createIndex({ userId: 1, createdAt: -1 });
db.chats.createIndex({ createdAt: 1 });

print('MongoDB initialization completed successfully.');