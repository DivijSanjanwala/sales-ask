import React from 'react';
import { Person, ContactRecordings } from '@/app/lib/types/types';
import { Button } from '@/app/components/Button';
import { createNoteForContact } from '@/app/api/helpers';

interface PersonRowProps {
    person: Person;
    recordings?: ContactRecordings;
    isLoading: boolean;
}

export const PersonRow: React.FC<PersonRowProps> = ({ person, recordings, isLoading }) => {

/**
 * Fetch call recordings for a single contact by contactId
 * @param contactId GHL contact ID
 * @param email Optional email for response mapping
 * @param locationId Optional GHL location ID
 * @returns ContactRecordingResponse
 */

async function getCallRecordingByContact(contactId: string, email?: string, locationId?: string): Promise<ContactRecordings | null> {
    try {
        const res = await fetch('/api/get-call-recording-by-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId, email, locationId }),
        });

        if (!res.ok) {
        throw new Error(`Failed to fetch recordings: ${res.status}`);
        }

        const data = await res.json();
        return data as ContactRecordings;
    } catch (err) {
        console.error('Error fetching contact recordings:', err);
        return null;
    }
}

    const handleFetchRecordings = async () => {
        if (isLoading) return;
        try {
            const res = await getCallRecordingByContact(person.contactId, person.email);
            if (res) {
                recordings = res;
            }
            console.log('Fetched recordings:', recordings);
        } catch (error) {
            console.error('Error fetching recordings:', error);
        }
    };

    const handleCreateNote = async () => {
        try {
            let summary = `Summary of call recordings for ${person.firstName} ${person.lastName}:\n This is an example AI summary of the call recordings.`;
            const result = await createNoteForContact(person.contactId, summary);
            if (result) {
                alert('Summary successfully created as a note');
            }
        } catch (error) {
            console.error('Error creating note:', error);
            alert('Failed to create note');
        }
    };
    
    return (
        <>
        <tr className="border-b">
            <td className="p-2 text-black">{person.contactId}</td>
            <td className="p-2 text-black">{person.firstName}</td>
            <td className="p-2 text-black">{person.lastName}</td>
            <td className="p-2 text-black">{person.phone}</td>
            <td className="p-2 text-black">{person.email}</td>
        </tr>
        {recordings?.conversations && recordings.conversations.length > 0 && (
            <tr>
                <td colSpan={4} className="bg-[#1a1a1a] p-4">
                    <ul className="space-y-2">
                        {recordings.conversations.map((convo, i) => (
                            <li key={i} className="border border-accent rounded p-2 text-black bg-white">
                                <ul className="pl-4 list-disc">
                                    {convo.messages.map((msg, j) => (
                                        msg.recording?.recordingUrl ? (
                                            <li key={j}>
                                                Recording: <a className="text-accent underline" href={msg.recording.recordingUrl} target="_blank" rel="noopener noreferrer">Listen</a>
                                            </li>
                                        ) : null
                                    ))}
                                </ul>
                            </li>
                        ))}
                        {recordings.conversations.length > 0 && (
                            <li className="mt-4 flex justify-end">
                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={handleCreateNote}
                                    disabled={isLoading}
                                >
                                    Create AI Summary Note
                                </Button>
                            </li>
                        )}
                    </ul>
                </td>
            </tr>
        )}
    </>
)
}
