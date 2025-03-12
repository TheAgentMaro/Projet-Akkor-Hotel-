import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Home = () => {
  const { user } = useContext(AuthContext);

  // Destinations populaires
  const popularDestinations = [
    { id: 1, name: 'Paris', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=300&h=200&auto=format', description: 'La ville de l\'amour avec ses monuments emblématiques' },
    { id: 2, name: 'New York', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=300&h=200&auto=format', description: 'La ville qui ne dort jamais, célèbre pour ses gratte-ciels' },
    { id: 3, name: 'Tokyo', image: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?q=80&w=300&h=200&auto=format', description: 'Un mélange fascinant de tradition et de modernité' },
    { id: 4, name: 'Bali', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=300&h=200&auto=format', description: 'Plages paradisiaques et culture balinaise authentique' },
  ];

  // Services proposés
  const services = [
    { id: 1, name: 'Réservation Instantanée', icon: '⚡', description: 'Confirmez votre réservation en quelques secondes' },
    { id: 2, name: 'Annulation Gratuite', icon: '✓', description: 'Annulez sans frais jusqu\'à 24h avant votre arrivée' },
    { id: 3, name: 'Service Client 24/7', icon: '🕒', description: 'Notre équipe est disponible à tout moment pour vous assister' },
    { id: 4, name: 'Meilleur Prix Garanti', icon: '💰', description: 'Nous vous remboursons la différence si vous trouvez moins cher' },
  ];

  // Témoignages clients
  const testimonials = [
    { id: 1, name: 'Sophie Martin', role: 'Voyageuse Fréquente', comment: 'Akkor Hotel a transformé ma façon de voyager. Le processus de réservation est simple et les hôtels sont toujours à la hauteur de mes attentes.', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { id: 2, name: 'Thomas Dubois', role: 'Voyageur d\'Affaires', comment: 'En tant que professionnel qui voyage souvent, je peux compter sur Akkor Hotel pour des hébergements de qualité et un service impeccable.', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  ];

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-800 text-white py-20">
        <div className="container mx-auto px-4 z-10 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Découvrez le Confort avec Akkor Hotel</h1>
            <p className="text-xl mb-8">
              Des hébergements de qualité dans les plus belles destinations du monde, 
              adaptés à tous vos besoins et à tous les budgets.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/hotels" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg transition duration-300">
                Explorer nos Hôtels
              </Link>
              {!user && (
                <Link to="/register" className="bg-transparent hover:bg-white/10 border-2 border-white font-semibold py-3 px-6 rounded-lg transition duration-300">
                  Créer un Compte
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-black opacity-30"></div>
      </section>

      {/* Destinations Populaires */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Destinations Populaires</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {popularDestinations.map((destination) => (
            <div key={destination.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300">
              <img src={destination.image} alt={destination.name} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2">{destination.name}</h3>
                <p className="text-gray-600">{destination.description}</p>
                <Link to="/hotels" className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium">
                  Voir les hôtels →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Nos Services */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Pourquoi Choisir Akkor Hotel?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <div key={service.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300 text-center">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="font-bold text-xl mb-2">{service.name}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Ce que Disent Nos Clients</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <h3 className="font-bold">{testimonial.name}</h3>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-700 italic">"{testimonial.comment}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Prêt à Découvrir le Monde avec Akkor Hotel?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers de voyageurs satisfaits et commencez à créer des souvenirs inoubliables.
          </p>
          <Link to="/hotels" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold py-3 px-8 rounded-lg transition duration-300 inline-block">
            Voir nos hôtels et réserver
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
