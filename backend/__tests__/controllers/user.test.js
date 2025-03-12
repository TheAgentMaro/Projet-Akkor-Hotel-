describe('GET /api/users/me', () => {
  it('should get user profile with valid token', async () => {
    const res = await request(app)
      .get('/api/users/me') // Changement de /profile à /me
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(userData.email);
  });

  it('should not get profile without token', async () => {
    const res = await request(app)
      .get('/api/users/me'); // Changement de /profile à /me

    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/users/:id', () => {
  it('should let admin get any user', async () => {
    const res = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.email).toBe(userData.email);
  });

  it('should not let user get other user profiles', async () => {
    const otherUser = await User.create({
      email: 'other@test.com',
      pseudo: 'other',
      password: 'password123'
    });

    const res = await request(app)
      .get(`/api/users/${otherUser._id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
  });
});

describe('PUT /api/users/me', () => { // Changement de /:id à /me
  const updateData = {
    pseudo: 'updatedpseudo'
  };

  it('should let user update their own profile', async () => {
    const res = await request(app)
      .put('/api/users/me') // Changement de /:id à /me
      .set('Authorization', `Bearer ${userToken}`)
      .send(updateData);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.pseudo).toBe(updateData.pseudo);
  });

  it('should let admin update any user', async () => {
    const res = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateData);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.pseudo).toBe(updateData.pseudo);
  });

  it('should not let user update other profiles', async () => {
    const otherUser = await User.create({
      email: 'other@test.com',
      pseudo: 'other',
      password: 'password123'
    });

    const res = await request(app)
      .put(`/api/users/${otherUser._id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(updateData);

    expect(res.statusCode).toBe(403);
  });
});

describe('DELETE /api/users/me', () => { // Changement de /:id à /me
  it('should let user delete their own profile', async () => {
    const res = await request(app)
      .delete('/api/users/me') // Changement de /:id à /me
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    
    const deletedUser = await User.findById(userId);
    expect(deletedUser).toBeNull();
  });

  it('should let admin delete any user', async () => {
    const res = await request(app)
      .delete(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    
    const deletedUser = await User.findById(userId);
    expect(deletedUser).toBeNull();
  });

  it('should not let user delete other profiles', async () => {
    const otherUser = await User.create({
      email: 'other@test.com',
      pseudo: 'other',
      password: 'password123'
    });

    const res = await request(app)
      .delete(`/api/users/${otherUser._id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
    
    const userStillExists = await User.findById(otherUser._id);
    expect(userStillExists).toBeTruthy();
  });
});