import Tick from "@/assets/Tick"
import { Button } from "./ui/button"

export default function PricingSection(){
    return (
        <div className="flex justify-center items-center gap-4">
            <PricingElement planType="free" money="0" bestFor="individuals testing our platform" features={["Record up to 2 hours/month", "720p video and 128 kbps audio", "1 host + 1 guest", "Standard video/audio export"]} main={"bg-linear-to-b from-neutral-400 to-neutral-300"} className="bg-linear-to-tr from-black to-white from-60%" mainBlob="right-0 top-0" insideBlob="w-32 h-32" mostPopular={false} suitableFor={"Start free"}/>

            <PricingElement planType="professional" money="15" bestFor="Ideal for creators and small teams" features={["Record up to 20 hours/month","1080p video and 256 kbps audio ", "Up to 4 participants per recording", "Flexible recording: single or multi-track" ]} 
                main={"bg-linear-to-b from-blue-500 to-blue-400"} className="bg-linear-to-t from-black to-white from-60%  justify-center" mainBlob="top-0 left-1" insideBlob="w-108 h-40" mostPopular={true} suitableFor="small teams" />

            <PricingElement planType="enterprise" money="99" bestFor="For studios, large teams" features={["Unlimited recording hours", 
                "4K video Support", "Unlimited participants per session","Team collaboration & role-based access", ]} main={"bg-linear-to-b from-emerald-600 to-emerald-400"} className="bg-linear-to-tl from-black to-white from-60% justify-end" insideBlob="w-32 h-32" mainBlob="top-0 left-0" 
                mostPopular={false} suitableFor="contact us"/>
        </div>
    )
}

interface pricingProps{
    planType : string,
    money: string,
    bestFor: string,
    features: string[],
    main : string,
    className : string,
    mainBlob : string,
    insideBlob : string,
    mostPopular : boolean,
    suitableFor : string
}
function PricingElement({planType, money, bestFor, features,main, className, mainBlob, insideBlob, mostPopular, suitableFor}: pricingProps){
    return (
        <div className={`w-[351px] h-[501px] flex items-end rounded-2xl ${className}`}>
            <div className={`w-[350px] h-[500px] bg-neutral-900 rounded-2xl p-8 relative `}>
                <div className={`absolute ${mainBlob}`}>
                    <div className={` rounded-full bg-white/20 filter blur-2xl  ${insideBlob}`}></div>
                </div>
                <div className="text-3xl capitalize mb-8 text-neutral-300 flex justify-between">
                    <div>
                        <div className="text-sm text-green-400">{suitableFor}</div>
                        <div>{planType}</div>
                    </div>

                    <div className={`${mostPopular ? "text-xl backdrop-blur-xl px-4 py-2 rounded-3xl border-1 border-neutral-400/20" : "opacity-0"} flex items-center`}>most popular</div>
                </div>
                <div className="text-5xl mb-4">${money}.00<span className="text-xl text-neutral-500">/month</span></div>
                <div className="capitalize text-2xl mt-6 text-neutral-500">{bestFor}</div>
                <Button className={`w-full ${main}  my-12 border-[0.5px] border-blue-400" variant={"ghost"}`} size="lg">Sign up for {planType}</Button>
                <div className="flex items-center justify-center gap-2">
                    <div className="border-t-1 border-neutral-600  mt-6 text-neutral-900">write something</div>
                    <div className="text-xl font-bold">Features</div>
                    <div className="border-t-1 border-neutral-600  mt-6 text-neutral-900">write something</div>    
                </div>
                <div className="text-2xl font-light mt-4">
                    {features.map((feature) => 
                        <div className="flex my-4">
                            <Tick />{feature}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

