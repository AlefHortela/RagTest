import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../core/services/chat.service';
import { ChatMessage } from '../core/models/chat.model';

@Component({
  selector: 'app-chat',
  imports: [FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat {
  question = '';
  readonly messages = signal<ChatMessage[]>([]);
  readonly asking = signal(false);

  constructor(private chatService: ChatService) {}

  sourceLabel(sourceType: string): string {
    return sourceType === 'occurrence' ? 'Ocorrência' : 'Anexo';
  }

  submit(): void {
    const question = this.question.trim();
    if (!question || this.asking()) return;

    this.messages.update((msgs) => [...msgs, { role: 'user', text: question }]);
    this.question = '';
    this.asking.set(true);

    this.chatService.ask(question).subscribe({
      next: (response) => {
        this.messages.update((msgs) => [
          ...msgs,
          { role: 'assistant', text: response.answer, sources: response.sources },
        ]);
        this.asking.set(false);
      },
      error: () => {
        this.messages.update((msgs) => [
          ...msgs,
          { role: 'assistant', text: 'Não foi possível obter resposta do RAG.' },
        ]);
        this.asking.set(false);
      },
    });
  }
}
