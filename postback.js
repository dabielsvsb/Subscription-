const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  try {
    const { clickid, event: eventType, profit } = event.queryStringParameters || {};

    if (!clickid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: 'missing clickid' }),
      };
    }

    const store = getStore('conversions');
    const record = {
      clickid,
      event: eventType || 'unknown',
      profit: profit || null,
      receivedAt: new Date().toISOString(),
    };

    await store.set(clickid, JSON.stringify(record));
    console.log('Postback received:', record);

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error('Postback error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: 'internal error' }),
    };
  }
};
