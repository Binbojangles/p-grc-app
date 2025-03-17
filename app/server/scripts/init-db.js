const { sequelize, User, Control, Task, Review } = require('../models');

async function initializeDatabase() {
  console.log('Initializing database...');
  
  try {
    // Sync all models with the database
    // This will create tables if they don't exist
    // Force: true will drop tables if they exist
    await sequelize.sync({ force: true });
    
    // Create admin user
    const adminUser = await User.create({
      email: 'admin@example.com',
      password: 'admin123', // Will be hashed by the model hook
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      active: true
    });
    
    // Create manager user
    const managerUser = await User.create({
      email: 'manager@example.com',
      password: 'manager123', // Will be hashed by the model hook
      firstName: 'Manager',
      lastName: 'User',
      role: 'manager',
      active: true
    });
    
    // Create regular user
    const regularUser = await User.create({
      email: 'user@example.com',
      password: 'user123', // Will be hashed by the model hook
      firstName: 'Regular',
      lastName: 'User',
      role: 'user',
      active: true
    });
    
    // Create controls
    const control1 = await Control.create({
      controlId: 'CTL-001',
      title: 'Password Policy',
      description: 'Ensure strong password policies are implemented across all systems',
      category: 'Access Control',
      requirements: 'Passwords must be at least 12 characters long and include uppercase, lowercase, numbers, and special characters',
      guidance: 'Implement password policies in Active Directory and all critical systems',
      implementationStatus: 'partially-implemented',
      reviewFrequency: 'quarterly',
      nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
    });
    
    const control2 = await Control.create({
      controlId: 'CTL-002',
      title: 'Data Backup',
      description: 'Regular backup of critical data',
      category: 'Data Protection',
      requirements: 'All critical data must be backed up daily with weekly off-site backups',
      guidance: 'Use automated backup solutions with encryption',
      implementationStatus: 'implemented',
      reviewFrequency: 'monthly',
      nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });
    
    const control3 = await Control.create({
      controlId: 'CTL-003',
      title: 'Security Awareness Training',
      description: 'Regular security awareness training for all employees',
      category: 'Training',
      requirements: 'All employees must complete security awareness training annually',
      guidance: 'Use interactive training modules with quizzes',
      implementationStatus: 'not-implemented',
      reviewFrequency: 'annually',
      nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 365 days from now
    });
    
    // Create tasks
    const task1 = await Task.create({
      title: 'Update Password Policy',
      description: 'Review and update the password policy document',
      controlId: control1.id,
      assignedTo: managerUser.id,
      assignedDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      status: 'pending',
      priority: 'high',
      notes: 'Include new requirements for MFA'
    });
    
    const task2 = await Task.create({
      title: 'Test Backup Restoration',
      description: 'Perform a test restoration of critical data backups',
      controlId: control2.id,
      assignedTo: regularUser.id,
      assignedDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'in-progress',
      priority: 'medium',
      notes: 'Focus on financial data first'
    });
    
    const task3 = await Task.create({
      title: 'Develop Training Materials',
      description: 'Create security awareness training materials',
      controlId: control3.id,
      assignedTo: managerUser.id,
      assignedDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'pending',
      priority: 'medium',
      notes: 'Include phishing awareness'
    });
    
    // Create a review
    const review1 = await Review.create({
      controlId: control2.id,
      reviewerId: adminUser.id,
      reviewDate: new Date(),
      status: 'compliant',
      findings: 'Backup system is working as expected. All critical data is being backed up daily.',
      recommendations: 'Consider increasing backup frequency for financial data to twice daily',
      nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
    });
    
    console.log('Database initialized successfully!');
    
    // Close the database connection
    await sequelize.close();
    
  } catch (error) {
    console.error('Error initializing database:', error);
    
    // Close the database connection
    if (sequelize) {
      await sequelize.close();
    }
  }
}

// Run the initialization
initializeDatabase(); 