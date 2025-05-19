"use client";
import React, { useEffect, useState } from 'react';
import { Button } from '@/app/components/Button';
import { Card } from '@/app/components/Card';
import { CardContent } from '@/app/components/CardContent';
import { PersonRow } from '@/app/components/PersonRow'
import { Person, ContactRecordings } from '@/app/lib/types/types';
import { getAllRecordings, fetchAllContacts } from '@/app/api/helpers';


const Home = () => {
  const [recordings, setRecordings] = useState<Record<string, ContactRecordings>>({});
  const [loadingEmails, setLoadingEmails] = useState<string[]>([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const data = await fetchAllContacts();
        setContacts(data);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };
    fetchContacts();
  }
  , []);

  useEffect(() => {
    const fetchRecordingsForAll = async () => {
      setGlobalLoading(true);
      try {
        const data = await getAllRecordings();
        setRecordings(data || {});
      } catch (error) {
        console.error('Error fetching all recordings:', error);
      } finally {
        setGlobalLoading(false);
      }
    }
    fetchRecordingsForAll();
  }
  , []);

  const handleRefreshAll = async () => {
    setGlobalLoading(true);
    try {
      const data = await getAllRecordings();
      setRecordings(data || {});
    } catch (error) {
      console.error('Error fetching all recordings:', error);
    } finally {
      setGlobalLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 bg-[#0D0D0D] min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Call Recordings Dashboard</h1>
        <Button disabled={globalLoading} className="bg-accent" onClick={handleRefreshAll}>
          {globalLoading ? 'Fetching All...' : 'Refresh All Recordings'}
        </Button>
      </div>
      <Card className="bg-white">
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-black">First Name</th>
                <th className="p-2 text-black">Last Name</th>
                <th className="p-2 text-black">Phone</th>
                <th className="p-2 text-black">Email</th>
              </tr>
            </thead>
            <tbody>
              {
                contacts.map(person => (
                  <PersonRow
                    key={person.email}
                    person={person}
                    recordings={recordings[person.email]}
                    isLoading={loadingEmails.includes(person.email)}
                  />
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
