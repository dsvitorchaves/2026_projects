import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Contact } from './contact';
import { ContactService } from './contact.service';

type ContactGroup = {
  letter: string;
  items: Contact[];
};

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './contact-list.component.html',
  styleUrl: './contact-list.component.css',
})
export class ContactListComponent {
  private readonly service = inject(ContactService);

  readonly search = signal('');
  readonly selectedId = signal<string | null>(null);

  readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const list = [...this.service.contacts()].sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR'),
    );

    if (!q) return list;
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q),
    );
  });

  readonly favorites = computed(() =>
    this.filtered().filter((c) => c.favorite),
  );

  readonly groups = computed<ContactGroup[]>(() => {
    const map = new Map<string, Contact[]>();

    for (const contact of this.filtered()) {
      const first = (contact.name.trim()[0] || '#').toUpperCase();
      const base = first.normalize('NFD').replace(/\p{M}/gu, '');
      const key = /^[A-Z]$/.test(base) ? base : '#';
      const bucket = map.get(key) ?? [];
      bucket.push(contact);
      map.set(key, bucket);
    }

    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
      .map(([letter, items]) => ({ letter, items }));
  });

  select(id: string) {
    this.selectedId.update((current) => (current === id ? null : id));
  }

  initials(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  avatarTone(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const tones = ['tone-a', 'tone-b', 'tone-c', 'tone-d', 'tone-e'];
    return tones[Math.abs(hash) % tones.length];
  }

  toggleFavorite(id: string, event: Event) {
    event.stopPropagation();
    this.service.toggleFavorite(id);
  }

  remove(id: string, event: Event) {
    event.stopPropagation();
    if (confirm('Remover este contato?')) {
      this.service.remove(id);
      if (this.selectedId() === id) this.selectedId.set(null);
    }
  }
}
