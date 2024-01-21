// js/app.js
import { ajax } from 'rxjs/ajax';
import { interval } from 'rxjs';
import {
  switchMap, catchError, take, repeat,
} from 'rxjs/operators';

const messagesContainer = document.querySelector('.content-messages');
const apiUrl = 'https://vercel.com/ants-projects-edd85abf/rxjs-backend/2yftHDpRbyfJ47qLipy2cQ7vbnn1/';

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

const appendMessagesToContainer = (messages) => {
  messages.forEach((message) => {
    const formattedDate = formatTimestamp(message.received);
    const truncatedSubject = truncateSubject(message.subject);
    const messageRow = `<div class="message"><span>${message.from}</span><span>${truncatedSubject}</span><span>${formattedDate}</span></div>`;
    messagesContainer.insertAdjacentHTML('beforeend', messageRow);
  });
};

messageWidget.subscribe({
  next: (response) => {
    const newMessages = response.status === 'ok' ? response.messages : [];
    appendMessagesToContainer(newMessages);
  },
  error: (error) => {
    // eslint-disable-next-line no-console
    console.error('Произошла ошибка:', error);
    appendMessagesToContainer([]);
  },
});
