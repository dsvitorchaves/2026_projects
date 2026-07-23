import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ContactService } from './contact.service';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.css',
})
export class ContactFormComponent implements OnInit {
  private readonly service = inject(ContactService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  id: string | null = null;
  name = '';
  phone = '';
  email = '';
  notes = '';
  favorite = false;

  get isEdit() {
    return !!this.id;
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    if (!this.id) return;

    const found = this.service.getById(this.id);
    if (!found) {
      this.router.navigateByUrl('/');
      return;
    }

    this.name = found.name;
    this.phone = found.phone;
    this.email = found.email;
    this.notes = found.notes;
    this.favorite = found.favorite;
  }

  save() {
    const name = this.name.trim();
    if (!name) return;

    const payload = {
      name,
      phone: this.phone.trim(),
      email: this.email.trim(),
      notes: this.notes.trim(),
      favorite: this.favorite ?? false,
    };

    if (this.id) this.service.update(this.id, payload);
    else this.service.add(payload);

    this.router.navigateByUrl('/');
  }
}
