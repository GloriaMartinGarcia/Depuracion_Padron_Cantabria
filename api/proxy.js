import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { query } = req;

  const allowedParams = [
    'SERVICE', 'REQUEST', 'VERSION', 'LAYERS', 'STYLES', 'SRS',
    'CRS', 'BBOX', 'WIDTH', 'HEIGHT', 'FORMAT', 'TRANSPARENT',
    'QUERY_LAYERS', 'INFO_FORMAT', 'X', 'Y'
  ];

  const filteredQuery = Object.fromEntries(
    Object.entries(query).filter(([key]) =>
      allowedParams.includes(key.toUpperCase())
    )
  );

  const baseURL = "https://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx?";
  const queryString = new URLSearchParams(filteredQuery).toString();
  const url = `${baseURL}${queryString}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      res.status(response.status).send(errorText);
      return;
    }

    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    // CORS con validación segura
    const allowedOrigins = ['https://tusitio.com', 'http://localhost:3000'];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Cache-Control', 'public, max-age=3600');

    const data = await response.text();
    res.status(200).send(data);
  } catch (error) {
    console.error('Error al obtener datos del WMS:', error.message || error);
    res.status(500).json({ message: 'Error al obtener datos del WMS' });
  }
}
