import { Injectable, signal } from '@angular/core';
import { Contact } from './contact';

const KEY = 'elo-contacts';
const SEED_KEY = 'elo-demo-v2';

type ContactInput = Omit<Contact, 'id'>;

const DEMO: Contact[] = [
  {
    id: 'c1',
    name: 'Ana Souza',
    phone: '11987654321',
    email: 'ana.souza@email.com',
    notes: 'Faculdade',
    favorite: true,
  },
  {
    id: 'c2',
    name: 'Bruno Lima',
    phone: '21999887766',
    email: 'bruno.lima@email.com',
    notes: '',
    favorite: true,
  },
  {
    id: 'c3',
    name: 'Carla Mendes',
    phone: '31988776655',
    email: 'carla.m@email.com',
    notes: 'Trabalho',
    favorite: false,
  },
  {
    id: 'c4',
    name: 'Diego Rocha',
    phone: '41977665544',
    email: 'diego.rocha@email.com',
    notes: '',
    favorite: false,
  },
  {
    id: 'c5',
    name: 'Elena Martins',
    phone: '51966554433',
    email: 'elena.m@email.com',
    notes: 'Vizinha',
    favorite: true,
  },
  {
    id: 'c6',
    name: 'Felipe Castro',
    phone: '61955443322',
    email: 'felipe.c@email.com',
    notes: '',
    favorite: false,
  },
  {
    id: 'c7',
    name: 'Giulia Nunes',
    phone: '71944332211',
    email: 'giulia.n@email.com',
    notes: 'Projeto freelance',
    favorite: false,
  },
  {
    id: 'c8',
    name: 'Henrique Alves',
    phone: '81933221100',
    email: 'henrique.a@email.com',
    notes: '',
    favorite: false,
  },
  {
    id: 'c9',
    name: 'Isabela Freitas',
    phone: '85922110099',
    email: 'isabela.f@email.com',
    notes: 'Irmã',
    favorite: true,
  },
  {
    id: 'c10',
    name: 'João Pedro Santos',
    phone: '62911009988',
    email: 'joao.pedro@email.com',
    notes: '',
    favorite: false,
  },
];

@Injectable({ providedIn: 'root' })
export class ContactService {
  readonly contacts = signal<Contact[]>(this.read());

  private normalize(raw: unknown): Contact[] {
    if (!Array.isArray(raw)) return [];

    return raw.map((item) => {
      const row = item as Partial<Contact>;
      return {
        id: row.id ?? crypto.randomUUID(),
        name: row.name ?? 'Sem nome',
        phone: row.phone ?? '',
        email: row.email ?? '',
        notes: row.notes ?? '',
        favorite: Boolean(row.favorite),
      };
    });
  }

  private read(): Contact[] {
    try {
      if (!localStorage.getItem(SEED_KEY)) {
        localStorage.setItem(KEY, JSON.stringify(DEMO));
        localStorage.setItem(SEED_KEY, '1');
        return DEMO;
      }

      const raw = localStorage.getItem(KEY);
      return raw ? this.normalize(JSON.parse(raw)) : [];
    } catch {
      return DEMO;
    }
  }

  private write(list: Contact[]) {
    localStorage.setItem(KEY, JSON.stringify(list));
    localStorage.setItem(SEED_KEY, '1');
    this.contacts.set(list);
  }

  add(data: ContactInput) {
    const next: Contact = { ...data, id: crypto.randomUUID() };
    this.write([next, ...this.contacts()]);
  }

  update(id: string, data: ContactInput) {
    this.write(
      this.contacts().map((c) => (c.id === id ? { ...data, id } : c)),
    );
  }

  remove(id: string) {
    this.write(this.contacts().filter((c) => c.id !== id));
  }

  toggleFavorite(id: string) {
    this.write(
      this.contacts().map((c) =>
        c.id === id ? { ...c, favorite: !c.favorite } : c,
      ),
    );
  }

  getById(id: string) {
    return this.contacts().find((c) => c.id === id);
  }
}
