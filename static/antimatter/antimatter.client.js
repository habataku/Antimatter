function proxify(inputUrl) {
  const proxyUrl = new URL('https://localhost:8080/', location.origin);

  proxyUrl.searchParams.set('url', btoa(inputUrl));

  if (document.cookie) {
    const cookies = document.cookie.split('; ');
    proxyUrl.headers.append('Cookie', cookies.join('; '));
  }

  const auth = localStorage.getItem('auth');
  if (auth) {
    proxyUrl.headers.append('Authorization', auth);
  }

  return proxyUrl.toString();
}
