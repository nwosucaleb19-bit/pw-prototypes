/** A representative subset of Nigerian states and their LGAs for the prototype. */
export const STATES: Record<string, string[]> = {
  Abia: ['Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano', 'Isiala Ngwa North', 'Umuahia North', 'Umuahia South'],
  Anambra: ['Aguata', 'Awka North', 'Awka South', 'Idemili North', 'Nnewi North', 'Nnewi South', 'Onitsha North', 'Onitsha South'],
  'Akwa Ibom': ['Eket', 'Ikot Ekpene', 'Itu', 'Oron', 'Uyo'],
  Delta: ['Aniocha North', 'Ethiope East', 'Ika South', 'Oshimili South', 'Sapele', 'Udu', 'Ughelli North', 'Warri South'],
  Edo: ['Egor', 'Esan West', 'Ikpoba-Okha', 'Oredo', 'Ovia North-East', 'Uhunmwonde'],
  Enugu: ['Enugu East', 'Enugu North', 'Enugu South', 'Nkanu West', 'Nsukka', 'Udi'],
  'Federal Capital Territory': ['Abaji', 'Abuja Municipal', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali'],
  Kaduna: ['Chikun', 'Igabi', 'Kaduna North', 'Kaduna South', 'Zaria'],
  Kano: ['Dala', 'Fagge', 'Gwale', 'Kano Municipal', 'Nassarawa', 'Tarauni', 'Ungogo'],
  Kwara: ['Asa', 'Ilorin East', 'Ilorin South', 'Ilorin West', 'Offa'],
  Lagos: [
    'Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Badagry', 'Epe', 'Eti-Osa',
    'Ibeju-Lekki', 'Ifako-Ijaiye', 'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland',
    'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere',
  ],
  Ogun: ['Abeokuta North', 'Abeokuta South', 'Ado-Odo/Ota', 'Ifo', 'Ijebu Ode', 'Obafemi Owode', 'Sagamu'],
  Ondo: ['Akure North', 'Akure South', 'Ondo East', 'Ondo West', 'Owo'],
  Osun: ['Ede North', 'Ife Central', 'Ilesa East', 'Olorunda', 'Osogbo'],
  Oyo: ['Akinyele', 'Egbeda', 'Ibadan North', 'Ibadan North-East', 'Ibadan South-West', 'Ido', 'Ogbomosho North', 'Oyo East'],
  Plateau: ['Bokkos', 'Jos East', 'Jos North', 'Jos South', 'Pankshin'],
  Rivers: ['Eleme', 'Ikwerre', 'Obio/Akpor', 'Oyigbo', 'Port Harcourt', 'Okrika'],
}

export const STATE_NAMES = Object.keys(STATES).sort()
