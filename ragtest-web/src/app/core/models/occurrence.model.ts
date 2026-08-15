export type OccurrenceType = 'Acidente' | 'Assalto' | 'Outro';

export interface Attachment {
  id: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface Occurrence {
  id: string;
  type: OccurrenceType;
  title: string;
  description: string;
  occurredAt: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  createdAt: string;
  attachments: Attachment[];
}

export interface OccurrenceCreateRequest {
  type: OccurrenceType;
  title: string;
  description: string;
  occurredAt: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
}
