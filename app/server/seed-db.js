const { User, Control, sequelize } = require('./models');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Load CMMC controls from JSON files
const loadControlsFromJson = () => {
  try {
    // Path to JSON files (adjust paths as needed)
    const level1ControlsPath = path.join(__dirname, './cmmc_level1_controls.json');
    const level2ControlsPath = path.join(__dirname, './cmmc_level2_controls.json');
    
    console.log('Looking for JSON files at:');
    console.log('Level 1:', level1ControlsPath);
    console.log('Level 2:', level2ControlsPath);
    
    // Read and parse the JSON files
    const level1Data = JSON.parse(fs.readFileSync(level1ControlsPath, 'utf8'));
    const level2Data = JSON.parse(fs.readFileSync(level2ControlsPath, 'utf8'));
    
    console.log(`Loaded ${level1Data.controls.length} Level 1 controls and ${level2Data.controls.length} Level 2 controls`);
    
    // Transform controls to match the database schema
    const transformedControls = [
      ...level1Data.controls.map(control => ({
        controlId: control.full_control_id,
        title: control.title,
        description: control.requirement_statement || `CMMC Level 1 - ${control.domain_id} Control`,
        category: control.domain_id,
        requirements: control.assessment_objectives ? control.assessment_objectives.join('\n') : '',
        guidance: control.discussion || '',
        implementationStatus: 'not-implemented',
        reviewFrequency: 'annually',
        level: 1
      })),
      ...level2Data.controls.map(control => ({
        controlId: control.full_control_id,
        title: control.title,
        description: control.requirement_statement || `CMMC Level 2 - ${control.domain_id} Control`,
        category: control.domain_id,
        requirements: control.assessment_objectives ? control.assessment_objectives.join('\n') : '',
        guidance: control.discussion || '',
        implementationStatus: 'not-implemented',
        reviewFrequency: 'annually',
        level: 2
      }))
    ];
    
    return transformedControls;
  } catch (error) {
    console.error('Error loading controls from JSON:', error);
    // Fallback to a few sample controls if loading fails
    return [
      {
        controlId: 'AC.L1.L1-b.1.i',
        title: 'Authorized Access Control [FCI Data]',
        description: 'CMMC Level 1 - Access Control',
        category: 'AC.L1',
        requirements: 'Limit information system access to authorized users, processes, and devices.',
        guidance: 'Implement access control measures.',
        implementationStatus: 'not-implemented',
        reviewFrequency: 'annually',
        level: 1
      },
      {
        controlId: 'AC.L2.L2-3.1.1',
        title: 'Authorized Access Control [CUI Data]',
        description: 'CMMC Level 2 - Access Control',
        category: 'AC.L2',
        requirements: 'Limit information system access to authorized users, processes, and devices.',
        guidance: 'Implement access control measures.',
        implementationStatus: 'not-implemented',
        reviewFrequency: 'annually',
        level: 2
      }
    ];
  }
};

// Initial admin user
const adminUser = {
  email: 'admin@example.com',
  password: 'Admin123!',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin'
};

// Function to seed the database
const seedDatabase = async () => {
  let transaction;
  
  try {
    // Start a transaction to ensure data consistency
    transaction = await sequelize.transaction();
    
    // Check if admin user exists
    const existingAdmin = await User.findOne({
      where: { email: adminUser.email },
      transaction
    });
    
    if (!existingAdmin) {
      // Create admin user if not exists
      const salt = crypto.randomBytes(16).toString('hex');
      const hashedPassword = crypto
        .pbkdf2Sync(adminUser.password, salt, 1000, 64, 'sha512')
        .toString('hex');
      
      const createdUser = await User.create({
        ...adminUser,
        password: hashedPassword,
        salt: salt
      }, { transaction });
      
      console.log('Admin user created:', createdUser.email);
    } else {
      console.log('Admin user already exists, skipping creation');
    }

    // Clear existing controls from the table
    await Control.destroy({ 
      where: {},
      truncate: true,
      cascade: true,
      transaction
    });
    console.log('Existing controls cleared from database');

    // Load controls from JSON files
    const controls = loadControlsFromJson();

    // Create controls
    await Control.bulkCreate(controls, { transaction });
    console.log(`${controls.length} controls created`);

    // Commit the transaction
    await transaction.commit();
    console.log('Database seeding complete');
  } catch (error) {
    // Rollback transaction on error
    if (transaction) await transaction.rollback();
    console.error('Database seeding failed:', error);
  }
};

// Run the seeding function
seedDatabase()
  .then(() => console.log('Seeding process finished'))
  .catch(err => console.error('Error in seeding process:', err)); 