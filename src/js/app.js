/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
// app.js
const express = require('express');
const cors = require('cors');
const { faker } = require('@faker-js/faker');
const { ajax } = require('rxjs/ajax');
const { interval } = require('rxjs');
const {
  switchMap, catchError, take, repeat,
} = require('rxjs/operators');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({ origin: '*' }));

const messagesContainer = document.querySelector('.content-messages');
const apiUrl = 'https://rxjs-backend-4tul8b5x1-ants-projects-edd85abf.vercel.app/';

const messageWidget = interval(5000).pipe(
  switchMap(() => ajax.getJSON(`${apiUrl}messages/unread`).pipe(
    catchError(() => []),
    take(1),
  )),
  repeat(),
);

const truncateSubject = (subject) => (subject.length <= 15 ? subject : `${subject.substring(0, 15)}...`);
const formatTimestamp = (received) => {
  const date = new Date(received * 1000);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${hours}:${minutes} ${day}.${month}.${year}`;
};

const appendMessageToContainer = (message) => {
  const formattedDate = formatTimestamp(message.received);
  const truncatedSubject = truncateSubject(message.subject);
  const messageRow = `<div class="message"><span>${message.from}</span><span>${truncatedSubject}</span><span>${formattedDate}</span></div>`;
  messagesContainer.insertAdjacentHTML('beforeend', messageRow);
};

app.get('/messages/unread', (req, res) => {
  const generateFakeMessage = () => ({
    id: faker.string.uuid(),
    from: faker.internet.email(),
    subject: faker.lorem.words(3),
    body: faker.lorem.paragraph(),
    received: Math.floor(Date.now() / 1000),
  });

  const fakeMessages = Array.from({ length: 1 }, generateFakeMessage);
  const response = { status: 'ok', messages: fakeMessages };
  res.json(response);
});

messageWidget.subscribe({
  next: (response) => {
    const newMessages = response.status === 'ok' ? response.messages : [];
    newMessages.forEach((message) => appendMessageToContainer(message));
  },
  error: (error) => {
    console.error('Произошла ошибка:', error);
  },
});

app.listen(port, () => {
  console.log('Сервер запущен на порту:', `${port}`);
});
