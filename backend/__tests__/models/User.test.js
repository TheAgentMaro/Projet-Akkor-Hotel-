const mongoose = require('mongoose');
const User = require('../../src/models/User');

require('../config/test-setup');

describe('User Model Test', () => {
  const validUserData = {
    email: 'test@test.com',
    pseudo: 'testuser',
    password: 'password123'
  };

  it('should create & save user successfully', async () => {
    const validUser = new User(validUserData);
    const savedUser = await validUser.save();
    
    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe(validUserData.email);
    expect(savedUser.pseudo).toBe(validUserData.pseudo);
    expect(savedUser.password).not.toBe(validUserData.password); // Le mot de passe doit être hashé
    expect(savedUser.role).toBe('user'); // Rôle par défaut
  });

  it('should fail to save user without required fields', async () => {
    const userWithoutRequiredField = new User({ email: 'test@test.com' });
    let err;
    
    try {
      await userWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it('should fail to save user with invalid email', async () => {
    const userWithInvalidEmail = new User({
      ...validUserData,
      email: 'invalid-email'
    });
    let err;
    
    try {
      await userWithInvalidEmail.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it('should compare password correctly', async () => {
    const user = new User(validUserData);
    await user.save();
    
    const isMatch = await user.comparePassword(validUserData.password);
    const isNotMatch = await user.comparePassword('wrongpassword');
    
    expect(isMatch).toBe(true);
    expect(isNotMatch).toBe(false);
  });

  it('should not expose password in toJSON', async () => {
    const user = new User(validUserData);
    await user.save();
    
    const userJSON = user.toJSON();
    
    expect(userJSON.password).toBeUndefined();
    expect(userJSON.email).toBe(validUserData.email);
  });
});
