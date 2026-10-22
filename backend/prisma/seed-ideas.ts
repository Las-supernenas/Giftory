import { Interest } from '@prisma/client';

export const LUCIA_EMAIL = 'lucia@giftory.dev';
export const MARCOS_EMAIL = 'marcos@giftory.dev';

export type SeedIdea = {
  creatorEmail: string;
  name: string;
  price: number;
  interests: Interest[];
  description: string;
  productUrl: string | null;
  // File name inside prisma/seed-images. If the file is missing, the idea is created without image
  image: string | null;
};

// Real store search pages: they always work and do not pretend to be a specific product
export function storeSearchUrl(query: string): string {
  return `https://www.amazon.es/s?k=${encodeURIComponent(query)}`;
}

// Covers every Interest (checked at the start of the seed) with prices from 0 € to about 130 €
export const SEED_IDEAS: SeedIdea[] = [
  // · Lucía
  {
    creatorEmail: LUCIA_EMAIL,
    name: 'Auriculares inalámbricos True Wireless',
    price: 169,
    interests: [Interest.TECHNOLOGY, Interest.MUSIC],
    description: 'Para disfrutar de su música favorita con un diseño innovador.',
    productUrl:
      'https://www.elcorteingles.es/electronica/A200280373-6942103169434-pr-auriculares-true-wireless-huawei-freeclip-2-negro/',
    image: 'auriculares.jpg',
  },
  {
    creatorEmail: LUCIA_EMAIL,
    name: 'Soporte Sauron para mandos',
    price: 49.95,
    interests: [Interest.GAMING, Interest.TECHNOLOGY],
    description: 'Soporte para cascos gaming y mandos, para los fans de El Señor de los Anillos.',
    productUrl:
      'https://www.amazon.es/Grupo-Erik-Auriculares-Accesorios-Merchandising/dp/B0HGMBB1M1/ref=sr_1_15',
    image: 'soporte-mando.webp',
  },
  {
    creatorEmail: LUCIA_EMAIL,
    name: 'Cámara instantánea',
    price: 89,
    interests: [Interest.PHOTOGRAPHY],
    description: 'Fotos impresas al momento para guardar los mejores recuerdos.',
    productUrl: "https://www.amazon.es/C%C3%A1mara-instant%C3%A1nea-instax-Dreamy-Purple/dp/B0H3CF2N5J/ref=sr_1_7?dib=eyJ2IjoiMSJ9.K1n6_mVUznAQC7N2rxQla_c0gX4RE9gtARLTupguEH8rpwBcm_-5eAF4w0H7mZ1gJTAbZpzda6g-pSGK6lYIkW-ogLIaP4cFz-cbs_90sHzp5t78khkhx6N2JcuV0R7Rt1-_4hYYr13R0kMzfFfnf-tVgHOsRvzk0WZN5ioVXxTehHr7a0ryeNJfn_cFYjvmsCnpL4ooijk1rwnlmIP1DBxtBRZVo4Kvl3GyBtXLv_IrUEbvWKb4ZcF2Y3dwCimjCwOyWFDM_cn9vvY3nLG6mMWHvTCg__OEwke2CKBzOf0.YnOwd6yygYtVHqmG4pUy9KSqpKy9ZilkVt04Jy1Ik1s&dib_tag=se&keywords=c%C3%A1mara+instant%C3%A1nea&qid=1792506452&sr=8-7&ufe=app_do%3Aamzn1.fos.fde3827e-5b32-4544-acac-9bcf8407a6a6",
    image: 'camara-instantanea.jpg',
  },
  {
    creatorEmail: LUCIA_EMAIL,
    name: 'Póster de Blade Runner',
    price: 7.95,
    interests: [Interest.FILM_AND_TV],
    description: 'Póster de la película Blade Runner (1982).',
    productUrl: null,
    image: 'poster.jpg',
  },
  {
    creatorEmail: LUCIA_EMAIL,
    name: 'Tocadiscos de maleta',
    price: 75,
    interests: [Interest.MUSIC, Interest.HOME_AND_DECOR],
    description: 'Estilo retro para escuchar vinilos en cualquier rincón de casa.',
    productUrl: 'https://www.amazon.es/Muse-MT501-ATC-Tocadiscos-Platino/dp/B09J547MHP',
    image: 'tocadiscos.jpg',
  },
  {
    creatorEmail: LUCIA_EMAIL,
    name: 'E-reader',
    price: 169.99,
    interests: [Interest.BOOKS_AND_READING],
    description: 'Una biblioteca entera en el bolsillo.',
    productUrl: 'https://ereader.kobo.com/es-es/products/kobo-clara-bw',
    image: 'ebook.webp',
  },
  {
    creatorEmail: LUCIA_EMAIL,
    name: 'Globo terráqueo NATGEO',
    price: 51.44,
    interests: [Interest.SCIENCE, Interest.EDUCATION],
    description: 'Globo terráqueo con base de madera de haya e iluminación.',
    productUrl:
      'https://www.amazon.es/TECNODIDATTICA-Terr%C3%A1queo-Cartograf%C3%ADa-F%C3%ADsico-Pol%C3%ADtica-Geographic/dp/B081TQNS87/ref=sr_1_2_sspa',
    image: 'globo.webp',
  },
  {
    creatorEmail: LUCIA_EMAIL,
    name: 'Atlas histórico ilustrado',
    price: 29.9,
    interests: [Interest.HISTORY, Interest.BOOKS_AND_READING],
    description: 'Un viaje por la historia del mundo a través de mapas.',
    productUrl: storeSearchUrl('atlas histórico ilustrado'),
    image: 'atlas-historico.jpg',
  },
  {
    creatorEmail: LUCIA_EMAIL,
    name: 'Curso online de italiano',
    price: 49,
    interests: [Interest.LANGUAGES, Interest.EDUCATION],
    description: 'Para preparar su próximo viaje a Italia.',
    productUrl: null,
    image: 'curso-italiano.jpg',
  },
  {
    creatorEmail: LUCIA_EMAIL,
    name: 'Set de acuarelas profesional',
    price: 118,
    interests: [Interest.ART_AND_DESIGN],
    description: 'Colores intensos y pinceles de calidad para pintar sin límites.',
    productUrl:
      'https://hartem.com/caja-de-madera-azul-de-48-godets-de-acuarela-y-pincel-white-nights.html',
    image: 'acuarelas.webp',
  },
  {
    creatorEmail: LUCIA_EMAIL,
    name: 'Kit para hacer velas aromáticas',
    price: 24.99,
    interests: [Interest.CRAFTS_AND_DIY, Interest.HOME_AND_DECOR],
    description: 'Todo lo necesario para crear sus propias velas.',
    productUrl: storeSearchUrl('kit hacer velas aromáticas'),
    image: 'velas.jpg',
  },
  {
    creatorEmail: LUCIA_EMAIL,
    name: 'Cuaderno para colorear',
    price: 7.66,
    interests: [Interest.ART_AND_DESIGN, Interest.CRAFTS_AND_DIY],
    description:
      'Para relajarse y desconectar con un adorable libro para colorear. ¡Es hora de ponerse cómodo!',
    productUrl:
      'https://www.amazon.es/Cozy-Corner-Calm-Comforting-Colouring/dp/024176422X/ref=asc_df_024176422X',
    image: 'cuaderno-colorear.webp',
  },
  {
    creatorEmail: LUCIA_EMAIL,
    name: 'Bolso patchwork hecho a mano',
    price: 41.06,
    interests: [Interest.FASHION],
    description: 'Un tote bag único en color rosa pastel.',
    productUrl:
      'https://www.etsy.com/es/listing/4445769357/handmade-patchwork-tote-bag-pastel-pink',
    image: 'bolso.webp',
  },
  {
    creatorEmail: LUCIA_EMAIL,
    name: 'Pack pilates',
    price: 76.96,
    interests: [Interest.YOGA_AND_MEDITATION, Interest.FITNESS],
    description: 'Pack de accesorios para pilates. Perfecto para entrenar en casa.',
    productUrl:
      'https://www.elinapilates.com/eu/es/pack-accesorios/1404-pack-de-accesorios-de-pilates-kit-completo-para-entrenar-en-casa-o-gimnasio.html',
    image: 'pack-pilates.jpg',
  },
  {
    creatorEmail: LUCIA_EMAIL,
    name: 'Spa con desayuno',
    price: 38,
    interests: [Interest.WELLNESS_AND_SELF_CARE, Interest.BEAUTY_AND_SKINCARE],
    description: 'Acceso a spa + desayuno buffet. Perfecto para compartir.',
    productUrl:
      'https://www.hoteltreats.com/es/espana/baleares/mallorca/hm-palma-blanc/acceso-al-spa-con-desayuno-buffet-en-mallorca',
    image: 'spa.jpg',
  },
  {
    creatorEmail: LUCIA_EMAIL,
    name: 'Taza de cerámica artesanal',
    price: 18.5,
    interests: [Interest.COFFEE_AND_TEA, Interest.CRAFTS_AND_DIY],
    description: 'Hecha a mano y perfecta para los amantes del té. En color rosa coral.',
    productUrl: 'https://www.etsy.com/es/listing/4572395945/coral-pink-ceramic-mug-with-lavender',
    image: 'taza-ceramica.webp',
  },
  {
    creatorEmail: LUCIA_EMAIL,
    name: 'Cuaderno de cuero',
    price: 14.99,
    interests: [Interest.WRITING],
    description: 'Cuaderno de cuero, vintage con 80 páginas.',
    productUrl:
      'https://www.amazon.es/Cuaderno-Recargable-Encuadernado-Escuelas-Conferencias/dp/B0DWXPCHWM/ref=sr_1_9',
    image: 'cuaderno.jpg',
  },

  // · Marcos
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Pulsera de actividad',
    price: 35.91,
    interests: [Interest.FITNESS, Interest.TECHNOLOGY],
    description: 'Para seguir sus pasos, el sueño y los entrenamientos.',
    productUrl:
      'https://www.marjoya.com/relojes-marea/34900-pulsera-de-actividad-marea-azul-marino-b570152.html',
    image: 'pulsera-actividad.webp',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Mochila de senderismo WARDOW',
    price: 65,
    interests: [Interest.OUTDOOR_SPORTS, Interest.ADVENTURE],
    description: 'Ligera y resistente para rutas de un día. Capacidad 30L.',
    productUrl: 'https://es.wardow.com/products/osprey-hikelite-30-mochila-de-senderismo-10007578',
    image: 'mochila-senderismo.webp',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Camiseta oficial FCB',
    price: 69.99,
    interests: [Interest.TEAM_SPORTS],
    description: 'Para animar a su equipo en cada partido.',
    productUrl:
      'https://www.elcorteingles.es/deportes/A53979215-azul-granate-pr-camiseta-de-hombre-1-equipacion-fc-barcelona-2025-2026-stadium-nike/',
    image: 'camiseta-equipo.jpg',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Libro de recetas del mundo',
    price: 25,
    interests: [Interest.COOKING, Interest.TRAVEL],
    description: 'Viajar sin salir de la cocina.',
    productUrl: 'https://www.amazon.es/Recetas-del-Mundo-community-garcia/dp/B0DK3DKCBJ/ref=sr_1_2',
    image: 'recetas-mundo.jpg',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Set de repostería con moldes',
    price: 29.95,
    interests: [Interest.BAKING],
    description: 'Moldes y utensilios para sus mejores tartas.',
    productUrl: 'https://www.kaufland.es/product/561429930/',
    image: 'reposteria.webp',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Cata de vinos para dos',
    price: 87,
    interests: [Interest.FOOD_AND_GASTRONOMY, Interest.CULTURAL_EXPERIENCES],
    description: 'Una experiencia para descubrir sabores en buena compañía.',
    productUrl:
      'https://www.winedering.com/es/among-the-best-wines-and-flavors-of-mallorca_d10382_travel',
    image: 'cata-vinos.webp',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Cafetera de goteo manual',
    price: 33.9,
    interests: [Interest.COFFEE_AND_TEA],
    description: 'Para preparar el café con calma y disfrutar de todo su sabor.',
    productUrl:
      'https://www.amazon.es/LMSAWK-Vidrio-port%C3%A1til-Cafetera-Lavavajillas/dp/B0FFYZQMV3',
    image: 'cafetera.jpg',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Kit de huerto urbano',
    price: 29.99,
    interests: [Interest.GARDENING, Interest.SUSTAINABILITY],
    description: 'Semillas, macetas y tierra para cultivar en el balcón.',
    productUrl: storeSearchUrl('kit huerto urbano'),
    image: 'huerto-urbano.jpg',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Telescopio',
    price: 62.5,
    interests: [Interest.NATURE_AND_WILDLIFE, Interest.SCIENCE],
    description: 'Para una cita romántica observando las estrellas.',
    productUrl:
      'https://www.mediamarkt.es/es/product/_telescopio-bresser-explorador70400-70-mm-azul-183775763.html',
    image: 'telescopio.webp',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Cama acolchada para mascotas',
    price: 39.99,
    interests: [Interest.PETS],
    description: 'El rincón más cómodo de la casa para su mascota.',
    productUrl: 'https://www.zarahome.com/es/cama-mascotas-borreguito-l44391009',
    image: 'cama-mascota.webp',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Taza calentadora de viaje',
    price: 29.99,
    interests: [Interest.COFFEE_AND_TEA, Interest.TRAVEL],
    description: 'Para los amantes del café "on the go".',
    productUrl:
      'https://www.amazon.es/Rauwseul-Hervidor-El%C3%A9ctrico-Calentadora-12V-24V/dp/B0D9661JDX/ref=asc_df_B0D9661JDX',
    image: 'calentador-cafe.webp',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Diario de viaje',
    price: 22,
    interests: [Interest.TRAVEL, Interest.WRITING],
    description: 'Para apuntar rutas, recuerdos y pegar entradas de cada viaje.',
    productUrl:
      'https://www.amazon.es/Lanpn-Cuaderno-Mujeres-Recuerdos-Viajeros/dp/B0CJV474ZB/ref=asc_df_B0CJV474ZB',
    image: 'diario-viaje.jpg',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Bautismo de buceo',
    price: 129,
    interests: [Interest.ADVENTURE, Interest.OUTDOOR_SPORTS],
    description: 'Una primera inmersión guiada para descubrir el fondo del mar.',
    productUrl:
      'https://www.yumping.com/ofertas/buceo/mallorca/bautismo-de-buceo-en-palma-de-mallorca-3h--o28721',
    image: 'buceo.jpg',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Entradas para un musical',
    price: 110,
    interests: [Interest.CULTURAL_EXPERIENCES, Interest.MUSIC],
    description: 'Una noche de teatro, música y emoción.',
    productUrl: null,
    image: 'musical.jpg',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Lámpara de mesa de diseño',
    price: 41.65,
    interests: [Interest.HOME_AND_DECOR, Interest.ART_AND_DESIGN],
    description: 'Lámpara de diseño cálida, especial para su escritorio.',
    productUrl:
      'https://www.maisonsdumonde.com/ES/es/p/lampara-de-mesa-de-hierro-en-color-laton-12x12x28cm-mushlampio-M25190543.htm',
    image: 'lampara.jpg',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Rutina de cuidado facial',
    price: 99.95,
    interests: [Interest.BEAUTY_AND_SKINCARE],
    description: 'Set de cuidado facial reafirmante de Shiseido.',
    productUrl:
      'https://www.druni.es/estuche-vital-perfection-uplifting-firming-cream-shiseido-tratamiento-antiedad',
    image: 'cuidado-facial.jpg',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Álbum para colección de sellos',
    price: 35.96,
    interests: [Interest.COLLECTIBLES, Interest.HISTORY],
    description: 'Para ordenar y proteger su colección.',
    productUrl:
      'https://filabo.es/tapa-para-hojas-de-sellos/11-album-de-sellos-skay-con-cajetin.html',
    image: 'album-sellos.jpg',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Maqueta Ferrari 250 GTO',
    price: 2495,
    interests: [Interest.CARS_AND_MOTORSPORTS, Interest.COLLECTIBLES],
    description: 'Una pieza de colección única para los amantes del motor.',
    productUrl: 'https://www.ralphlauren.es/es/ferrari-250-gto-3615731998327.html',
    image: 'maqueta-coche.jpg',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Juego de ajedrez Black Onyx',
    price: 110.93,
    interests: [Interest.BOARD_GAMES_AND_PUZZLES, Interest.GAMING],
    description: 'Juego de ajedrez de mármol ónix negro: decoración vintage hecha a mano.',
    productUrl: 'https://www.etsy.com/es/listing/1770666031/black-onyx-marble-chess-set-handmade',
    image: 'juego-mesa.webp',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Puzzle de 1000 piezas',
    price: 18.95,
    interests: [Interest.BOARD_GAMES_AND_PUZZLES],
    description: 'Un reto relajante para varias tardes.',
    productUrl:
      'https://www.elcorteingles.es/juguetes/A200036930-puzzle-1000-piezas-arte-klimt-el-beso-ravensburger/',
    image: 'puzzle.jpg',
  },
  {
    creatorEmail: MARCOS_EMAIL,
    name: 'Experiencia en circuito de karts',
    price: 55,
    interests: [Interest.CARS_AND_MOTORSPORTS, Interest.ADVENTURE],
    description: 'Velocidad y adrenalina en un circuito profesional.',
    productUrl: null,
    image: 'karts.jpg',
  },
];

// Ideas the demo user keeps in the Library: more than 9 so pagination can be shown
