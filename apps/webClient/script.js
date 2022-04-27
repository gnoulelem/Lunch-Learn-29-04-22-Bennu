const source = new EventSource('http://localhost:8000/notifications');

source.addEventListener(
  'open',
  () => {
    console.log('Connections to the server established..');
  },
  false
);

source.onmessage = function (e) {
  console.log(JSON.parse(e.data));
  const notification = JSON.parse(e.data);
  document.getElementById(
    'content'
  ).innerHTML += `<div class="notification"><h4>${notification.value.title}</h4><p>${notification.value.content}</p></div>`;
  console.log(notification);
};
