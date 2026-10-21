
import assert from 'node:assert/strict';
import { test, mock } from 'node:test';

import { MailgunEmailService } from '../../../src/infrastructure/services/MailgunEmailService';

const apiKey = 'test-api-key';
const domain = 'sandbox.example.mailgun.org';

const email = {
  to: 'recipient@example.com',
  subject: 'Giftory reminder',
  text: 'Your event is coming soon.',
};

test('sends a correctly formatted request to Mailgun', async () => {
  const fetchMock = mock.method(globalThis, 'fetch', async () => {
    return new Response(
      JSON.stringify({ message: 'Queued. Thank you.' }),
      { status: 200 },
    );
  });

  try {
    const service = new MailgunEmailService(apiKey, domain);

    await service.sendEmail(email);

    assert.equal(fetchMock.mock.callCount(), 1);

    const [url, options] = fetchMock.mock.calls[0].arguments;

    assert.equal(url, `https://api.mailgun.net/v3/${domain}/messages`);
    assert.equal(options.method, 'POST');

    const expectedCredentials = Buffer.from(`api:${apiKey}`).toString('base64');

    assert.equal(
      (options.headers as Record<string, string>).Authorization,
      `Basic ${expectedCredentials}`,
    );

    const formData = options.body as FormData;

    assert.equal(formData.get('from'), `Giftory <postmaster@${domain}>`);
    assert.equal(formData.get('to'), email.to);
    assert.equal(formData.get('subject'), email.subject);
    assert.equal(formData.get('text'), email.text);
  } finally {
    fetchMock.mock.restore();
  }
});

test('throws an error when Mailgun returns 401', async () => {
  const fetchMock = mock.method(globalThis, 'fetch', async () => {
    return new Response('Unauthorized', { status: 401 });
  });

  try {
    const service = new MailgunEmailService(apiKey, domain);

    await assert.rejects(
      service.sendEmail(email),
      /Mailgun failed to send email \(401\): Unauthorized/,
    );
  } finally {
    fetchMock.mock.restore();
  }
});

test('includes Mailgun error details when the request fails', async () => {
  const fetchMock = mock.method(globalThis, 'fetch', async () => {
    return new Response('Recipient is not authorized', { status: 400 });
  });

  try {
    const service = new MailgunEmailService(apiKey, domain);

    await assert.rejects(
      service.sendEmail(email),
      /Recipient is not authorized/,
    );
  } finally {
    fetchMock.mock.restore();
  }
});

test('propagates network errors', async () => {
  const fetchMock = mock.method(globalThis, 'fetch', async () => {
    throw new Error('Network unavailable');
  });

  try {
    const service = new MailgunEmailService(apiKey, domain);

    await assert.rejects(
      service.sendEmail(email),
      /Network unavailable/,
    );
  } finally {
    fetchMock.mock.restore();
  }
});

test('uses a custom Mailgun API base URL', async () => {
  const fetchMock = mock.method(globalThis, 'fetch', async () => {
    return new Response(null, { status: 200 });
  });

  try {
    const service = new MailgunEmailService(
      apiKey,
      domain,
      'https://api.eu.mailgun.net',
    );

    await service.sendEmail(email);

    assert.equal(
      fetchMock.mock.calls[0].arguments[0],
      `https://api.eu.mailgun.net/v3/${domain}/messages`,
    );
  } finally {
    fetchMock.mock.restore();
  }
});
