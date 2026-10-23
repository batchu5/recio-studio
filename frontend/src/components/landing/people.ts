// Free Unsplash portraits used as stand-in participants in the landing page visuals.
const unsplash = (id: string, w: number, h: number) =>
    `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&crop=faces&w=${w}&h=${h}&q=70`;

export const people = {
    you: { name: "You", initial: "Y", photo: (w = 960, h = 600) => unsplash("1599566150163-29194dcaad36", w, h) },
    sam: { name: "Sam", initial: "S", photo: (w = 960, h = 600) => unsplash("1438761681033-6461ffad8d80", w, h) },
};
