// Code à supprimer en mars 2024 quand plus aucun utilisateur n'aura l'ancien service worker
navigator.serviceWorker?.getRegistrations().then((registrations) => {
  if (registrations.length) {
    Promise.all(registrations.map(reg => reg.unregister()))
      .then(() => window.location.reload())
  }
})
