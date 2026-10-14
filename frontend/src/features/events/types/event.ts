// An event as the backend returns it

export type PersonEvent = {
  id: number;
  name: string;
  date: string; //YYYY-MM-DD
};

//Data we send to create or edit an event
export type EventInput = {
  name: string;
  date: string; //YYYY-MM-DD
};
