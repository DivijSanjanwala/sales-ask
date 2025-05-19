const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const GO_HIGH_LEVEL_TOKEN = process.env.GO_HIGH_LEVEL_TOKEN;

const myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Version", "2021-07-28");
    myHeaders.append("Authorization", "Bearer " + GO_HIGH_LEVEL_TOKEN);


/**
 * Fetches all contacts from the GHL API.
 * @param locationId The location ID to fetch contacts for
 * @returns Promise with contacts data
 */
export async function fetchAllContacts(locationId: string = 'u05ZSlGlNMllG61fIuW8') {
 
  try {

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow" as RequestRedirect
    };

    const response = await fetch(`${GHL_API_BASE}/contacts/?locationId=${locationId}`, requestOptions);

    if (!response.ok) {
      throw new Error(`Error fetching contacts: ${response.status}`);
    }

    const data = await response.json();
    
    return data.contacts.map((contact: any) => ({
      firstName: contact.firstNameRaw,
      lastName: contact.lastNameRaw,
      phone: contact.phone,
      email: contact.email,
      locationId: contact.locationId,
      contactId: contact.id,
    }));
  }
  catch (error) {
    console.error('Failed to fetch contacts:', error);
    throw error;
  }
}

/**
 * Fetches conversations by contact ID and location ID from GHL API.
 * @param contactId The contact ID to query conversations for
 * @param locationId The location ID to query within (default value provided)
 * @returns Promise with list of conversations
 */
export async function getConversationsByContactId(contactId: string, locationId: string = 'u05ZSlGlNMllG61fIuW8') {
    try {
      const requestOptions: RequestInit = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow' as RequestRedirect
      };

      const response = await fetch(`${GHL_API_BASE}/conversations/search?locationId=${locationId}&contactId=${contactId}`, requestOptions);

      if (!response.ok) {
        throw new Error(`Error fetching conversations: ${response.status}`);
      }

      const data = await response.json();

      return data.conversations || [];
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      throw error;
    }
}


/**
 * Fetches all messages for a given conversation ID from the GHL API.
 * @param conversationId The ID of the conversation to fetch messages from
 * @returns Promise with messages data
 */
export async function getMessagesByConversationId(conversationId: string) {
  try {
    const requestOptions: RequestInit = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    };

    const response = await fetch(
      `${GHL_API_BASE}/conversations/${conversationId}/messages`,
      requestOptions
    );

    if (!response.ok) {
      throw new Error(`Error fetching messages: ${response.status}`);
    }

    const data = await response.json();
    
    return data.messages.messages || [];

  } catch (error) {
    console.error('Failed to fetch messages:', error);
    throw error;
  }
}

/**
 * Fetches the WAV recording for a given messageId and locationId from GHL.
 * @param messageId The ID of the message
 * @param locationId The location ID
 * @returns Promise with recording Blob or null
 */
export async function getRecordingByMessageId(messageId: string, locationId: string) {
  try {
    const requestOptions: RequestInit = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    };

    const url = `${GHL_API_BASE}/conversations/messages/${messageId}/locations/${locationId}/recording`;

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Error fetching recording: ${response.status}`);
    }

    const blob = await response.blob();

    const filename = response.headers.get('Content-Disposition')?.split('filename=')[1] ?? 'recording.wav';
    const objectUrl = URL.createObjectURL(blob);

    return {
      blob,
      url: objectUrl,
      filename,
      contentType: response.headers.get('Content-Type'),
    };

  } catch (error) {
  }
}


export async function getAllRecordings(locationId: string = 'u05ZSlGlNMllG61fIuW8') {
  const result: Record<string, any> = {};

  try {
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

    return result;
  } catch (error) {
    console.error('Error in getAllRecordings:', error);
    throw error;
  }
}

/**
 * Creates a note for a given contact in the GHL system.
 * @param contactId The contact ID to post the note to
 * @param noteBody The content of the note
 * @returns The response from the GHL API (created note or status)
 */
export async function createNoteForContact(contactId: string, noteBody: string): Promise<any> {
  try {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Authorization', `Bearer ${GO_HIGH_LEVEL_TOKEN}`);
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    headers.append('Version', '2021-07-28');

    const urlencoded = new URLSearchParams();
    urlencoded.append('body', noteBody);

    const response = await fetch(
      `${GHL_API_BASE}/contacts/${contactId}/notes`,
      {
        method: 'POST',
        headers,
        body: urlencoded,
        redirect: 'follow',
      }
    );

    const text = await response.text();

    if (!response.ok) {
      console.error('GHL API error:', text);
      throw new Error(`Failed to create note: ${response.status}`);
    }

    try {
      return JSON.parse(text);
    } catch {
      return { rawResponse: text };
    }
  } catch (error) {
    console.error(`Error creating note for contact ${contactId}:`, error);
    throw error;
  }
}

