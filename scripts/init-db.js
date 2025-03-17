const { sequelize, User, Control } = require('../app/server/models');
const bcrypt = require('bcrypt');

// Sample CMMC controls data
const controls = [
  {
    controlId: 'AC.1.001',
    title: 'Access Control Policy',
    description: 'Establish an access control policy that includes the scope, roles, responsibilities, and compliance requirements.',
    category: 'Access Control',
    requirements: 'Document access control policies and procedures.',
    guidance: 'Ensure all personnel understand their access control responsibilities.',
    implementationStatus: 'not-implemented',
    reviewFrequency: 'annually'
  },
  {
    controlId: 'AC.1.002',
    title: 'Account Management',
    description: 'Limit information system access to authorized users, processes, and devices.',
    category: 'Access Control',
    requirements: 'Manage system accounts, including establishing conditions for group membership.',
    guidance: 'Implement account management procedures for system accounts.',
    implementationStatus: 'not-implemented',
    reviewFrequency: 'quarterly'
  },
  {
    controlId: 'IA.1.076',
    title: 'Identifier Management',
    description: 'Manage information system identifiers for users and devices.',
    category: 'Identification and Authentication',
    requirements: 'Manage identifiers by receiving authorization from authorized individuals.',
    guidance: 'Establish procedures for identifier management.',
    implementationStatus: 'not-implemented',
    reviewFrequency: 'semi-annually'
  },
  {
    controlId: 'IA.1.077',
    title: 'Authenticator Management',
    description: 'Manage information system authenticators for users and devices.',
    category: 'Identification and Authentication',
    requirements: 'Verify user identity before modifying authenticators.',
    guidance: 'Follow established authenticator management procedures.',
    implementationStatus: 'not-implemented',
    reviewFrequency: 'semi-annually'
  },
  {
    controlId: 'SC.1.175',
    title: 'Information in Transit',
    description: 'Protect the confidentiality of CUI at rest.',
    category: 'System and Communications Protection',
    requirements: 'Implement cryptographic mechanisms to prevent unauthorized disclosure.',
    guidance: 'Use FIPS-validated cryptography.',
    implementationStatus: 'not-implemented',
    reviewFrequency: 'quarterly'
  }
];

// Initial admin user
const adminUser = {
  email: 'admin@example.com',
  password: 'Admin123!',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin'
};

// Function to initialize the database
const initializeDatabase = async () => {
  try {
    // Sync the database (create tables)
    await sequelize.sync({ force: true });
    console.log('Database tables created');

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminUser.password, salt);
    
    const createdUser = await User.create({
      ...adminUser,
      password: hashedPassword
    });
    
    console.log('Admin user created:', createdUser.email);

    // Create controls
    await Control.bulkCreate(controls);
    console.log(`${controls.length} controls created`);

    console.log('Database initialization complete');
  } catch (error) {
    console.error('Database initialization failed:', error);
  } finally {
    await sequelize.close();
  }
};

// Run the initialization function
initializeDatabase(); 