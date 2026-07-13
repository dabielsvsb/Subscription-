const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const { clickid } = event.queryStringParameters || {};

    if (!clickid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ ok: false, error: 'missing clickid' }),
      };
    }

    const store = getStore('conversions');
    const raw = await store.get(clickid);

    if (!raw) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ converted: false }),
      };
    }

    const record = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const convertedEvents = ['subs', 'rebill', 'hold-aproved'];
    const isConverted = convertedEvents.includes(record.event);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        converted: isConverted,
        event: record.event,
        receivedAt: record.receivedAt,
      }),
    };
  } catch (err) {
    console.error('Status check error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, error: 'internal error' }),
    };
  }
};
