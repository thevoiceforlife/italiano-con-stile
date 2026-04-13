import personaggiData from '@/data/config/personaggi.json';
import unitaData from '@/data/config/unita.json';

export function getPersonaggio(id) {
  return personaggiData[id] || personaggiData['mario'];
}

export function getUnitaConfig(livello, unita) {
  return unitaData[livello]?.[`unit${unita}`] || null;
}

export function getAllPersonaggi() {
  return personaggiData;
}

export function getAllUnita() {
  return unitaData;
}
