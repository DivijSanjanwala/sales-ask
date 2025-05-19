export type Person = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  locationId: string;
  contactId: string;
}

export type RecordingMessage = {
  messageType: string;
  recording?: { recordingUrl: string };
}

export type Conversation = {
  id: string;
  messages: RecordingMessage[];
}

export type ContactRecordings = {
  conversations: Conversation[];
}

export type Contact = Person & {
  conversations?: ContactRecordings[];
}
