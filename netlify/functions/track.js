// netlify/functions/track.js
const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    let body = {};
    if (event.body) {
      body = JSON.parse(event.body);
    }

    const { clickid, eventType, network, phone } = body;

    if (!clickid || !eventType) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ ok: false, error: 'missing clickid or eventType' }),
      };
    }

    const store = getStore('engagement');
    const eventRecord = {
      clickid,
      eventType,
      network: network || null,
      phone: phone || null,
      timestamp: new Date().toISOString(),
    };

    const eventKey = `${clickid}:${Date.now()}:${eventType}`;
    await store.set(eventKey, JSON.stringify(eventRecord));

    console.log('Event tracked:', eventRecord);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error('Track error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, error: 'internal error' }),
    };
  }
};
