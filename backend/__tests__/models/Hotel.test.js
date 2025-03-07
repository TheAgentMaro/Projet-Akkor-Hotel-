const mongoose = require('mongoose');
const Hotel = require('../../src/models/Hotel');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Hotel Model Test', () => {
  it('should create & save hotel successfully', async () => {
    const validHotel = new Hotel({
      name: 'Grand Hotel',
      location: 'Paris',
      description: 'Un magnifique hôtel au cœur de Paris',
      picture_list: ['image1.jpg', 'image2.jpg']
    });
    const savedHotel = await validHotel.save();
    
    expect(savedHotel._id).toBeDefined();
    expect(savedHotel.name).toBe(validHotel.name);
    expect(savedHotel.location).toBe(validHotel.location);
    expect(savedHotel.description).toBe(validHotel.description);
    expect(savedHotel.picture_list).toEqual(validHotel.picture_list);
    expect(savedHotel.createdAt).toBeDefined();
    expect(savedHotel.updatedAt).toBeDefined();
  });

  it('should fail to save hotel without required fields', async () => {
    const hotelWithoutRequiredField = new Hotel({
      name: 'Grand Hotel'
      // location et description manquants
    });

    let err;
    try {
      await hotelWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.location).toBeDefined();
    expect(err.errors.description).toBeDefined();
  });

  it('should fail to save hotel with empty fields', async () => {
    const hotelWithEmptyFields = new Hotel({
      name: '',
      location: '',
      description: ''
    });

    let err;
    try {
      await hotelWithEmptyFields.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it('should save hotel without optional picture_list', async () => {
    const hotelWithoutPictures = new Hotel({
      name: 'Hotel Sans Images',
      location: 'Lyon',
      description: 'Un hôtel confortable à Lyon'
    });

    const savedHotel = await hotelWithoutPictures.save();
    expect(savedHotel._id).toBeDefined();
    expect(savedHotel.picture_list).toBeDefined();
    expect(savedHotel.picture_list).toHaveLength(0);
  });

  it('should update hotel successfully', async () => {
    const hotel = new Hotel({
      name: 'Hotel à Mettre à Jour',
      location: 'Nice',
      description: 'Description initiale'
    });

    const savedHotel = await hotel.save();
    const updatedLocation = 'Cannes';
    
    savedHotel.location = updatedLocation;
    const updatedHotel = await savedHotel.save();

    expect(updatedHotel.location).toBe(updatedLocation);
    expect(updatedHotel.updatedAt).not.toEqual(updatedHotel.createdAt);
  });

  it('should delete hotel successfully', async () => {
    const hotel = new Hotel({
      name: 'Hotel à Supprimer',
      location: 'Marseille',
      description: 'Hotel qui sera supprimé'
    });

    const savedHotel = await hotel.save();
    const deletedHotel = await Hotel.findByIdAndDelete(savedHotel._id);
    const fetchedHotel = await Hotel.findById(savedHotel._id);

    expect(deletedHotel._id).toEqual(savedHotel._id);
    expect(fetchedHotel).toBeNull();
  });
});
