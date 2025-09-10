interface TestimonialProps{
  animate: string,
}
const people = [
    {
      name: "Alex Morgan",
      profession: "Podcast Host",
      comment:
        "Recording high-quality podcasts remotely has never been this easy. The audio and video clarity blew me away.",
      photo: "https://randomuser.me/api/portraits/men/67.jpg",
    },
    {
      name: "Priya Sharma",
      profession: "Journalist",
      comment:
        "As a journalist, I interview guests from all over the world. This platform makes the entire process seamless and professional.",
      photo: "https://randomuser.me/api/portraits/women/39.jpg",
    },
    {
      name: "David Lee",
      profession: "Content Creator",
      comment:
        "The local recording feature is a game-changer. I don’t have to worry about internet drops ruining my sessions anymore.",
      photo: "https://randomuser.me/api/portraits/men/72.jpg",
    },
    {
      name: "Sofia Alvarez",
      profession: "Radio Producer",
      comment:
        "What I love the most is how simple it is for my non-technical guests to join a recording. It saves me so much time.",
      photo: "https://randomuser.me/api/portraits/women/59.jpg",
    },
    {
      name: "Michael Brown",
      profession: "YouTuber",
      comment:
        "Video quality is outstanding. It feels like a studio setup, even when I'm recording from home. would rate it 5 Star",
      photo: "https://randomuser.me/api/portraits/men/94.jpg",
    },
    {
      name: "Hannah Wilson",
      profession: "Entrepreneur & Podcaster",
      comment:
        "This tool helped me launch my podcast with zero hassle. Everything from recording to exporting just works perfectly.",
      photo: "https://randomuser.me/api/portraits/women/85.jpg",
    },
  ];

export default function Testimonials({animate}: TestimonialProps) {
  

  return (
    <div className="overflow-hidden mt-2">
      <ul className={`flex md:gap-2 md:flex-nowrap ${animate}`}>
        {[...people, ...people].map((person, index) => (
          <li key={index} className="flex-shrink-0 px-2">
            <TestimonialElement
              comment={person.comment}
              name={person.name}
              profession={person.profession}
              photo={person.photo}
            />
          </li>
        ))}
      </ul>
    </div>
    
  );
}

interface TestimonialElementProps{
    comment : string,
    name : string,
    profession: string,
    photo : string
}

function TestimonialElement({comment, name, profession, photo} : TestimonialElementProps){
    return <div className="w-[90vw] sm:w-[300px] bg-neutral-100 text-black rounded-2xl p-4 ">
        <div className=" m-1 font-semibold">{comment}</div>
        <div className="flex gap-2 items-end ">
            <img src={photo} className="rounded-full w-6 h-6 md:w-12 md:h-12 "/>
            <div>
                <div className="font-bold text-lg">{name}</div>
                <div>{profession}</div>
            </div>
        </div>
    </div>
}