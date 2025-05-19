import { NextRequest, NextResponse } from 'next/server';
import {
  getConversationsByContactId,
  getMessagesByConversationId,
  getRecordingByMessageId,
} from '@/app/api/helpers';

const DEFAULT_LOCATION_ID = 'u05ZSlGlNMllG61fIuW8';

/**
 * POST /api/get-call-recording-by-contact
 * Request Body: { contactId: string, email?: string, locationId?: string }
 * Response: { contactId, email, conversations }
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const contactId: string = body.contactId;
    const email: string = body.email || contactId;
    const locationId: string = body.locationId || DEFAULT_LOCATION_ID;

    if (!contactId) {
      return NextResponse.json({ error: 'Missing contactId' }, { status: 400 });
    }

    const conversations = await getConversationsByContactId(contactId);
    const enrichedConversations = [];

    for (const conversation of conversations) {
      const messages = await getMessagesByConversationId(conversation.id);

      const enrichedMessages = await Promise.all(
        messages.map(async (msg: any) => {
          if (msg.messageType === 'TYPE_CALL') {
            const recording = await getRecordingByMessageId(msg.id, locationId);
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

    return NextResponse.json({
      contactId,
      email,
      conversations: enrichedConversations,
    });

  } catch (error) {
    console.error('Error in /api/get-call-recording-by-contact:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
