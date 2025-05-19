import { NextRequest, NextResponse } from 'next/server';
import {
  fetchAllContacts,
  getConversationsByContactId,
  getMessagesByConversationId,
  getRecordingByMessageId,
} from '@/app/api/helpers';

const DEFAULT_LOCATION_ID = 'u05ZSlGlNMllG61fIuW8';

/**
 * POST /api/get-call-recordings
 * Request Body: { locationId?: string }
 * Response: { contacts: Record<string, { contact, conversations }> }
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const locationId: string = body.locationId || DEFAULT_LOCATION_ID;

    const result: Record<string, any> = {};
    const contacts = await fetchAllContacts(locationId);

    for (const contact of contacts) {
      const contactId = contact.contactId;
      const email = contact.email;

      const conversations = await getConversationsByContactId(contactId);
      const enrichedConversations = [];

      for (const conversation of conversations) {
        const messages = await getMessagesByConversationId(conversation.id);

        const enrichedMessages = await Promise.all(
          messages.map(async (msg: any) => {
            if (msg.messageType === 'TYPE_CALL') {
              const recording = await getRecordingByMessageId(msg.id, locationId);
              console.log('Recording:', recording);
              return {
                ...msg,
                recording: recording ? { recordingUrl: recording.url } : null,
              };
            }
            return msg;
          })
        );

        enrichedConversations.push({
          ...conversation,
          messages: enrichedMessages,
        });
      }

      result[email || contactId] = {
        contact,
        conversations: enrichedConversations,
      };
    }

    return NextResponse.json({ recordings: result });

  } catch (error) {
    console.error('Error in /api/get-call-recordings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
