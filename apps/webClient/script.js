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

//Form handling
const notification_form = document.getElementById('notification-form');

notification_form.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = notification_form.elements["title"].value;
  const content = notification_form.elements["message"].value;

  fetch(`http://localhost:3000/newpost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({title, content}),
    }).then(response => {
      console.log(response);
    }).catch(error => {
      console.log(error);
    })
});