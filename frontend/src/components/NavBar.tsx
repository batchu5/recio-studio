export function Navbar(){
    return (
        <div className="w-screen h-24 flex justify-center ">
            <div  className="h-12 w-full xl:w-320 border-1 border-white fixed top-4 rounded-xl backdrop-blur-lg z-10" >
                <div className="flex justify-between">
                    <div className="text-2xl mx-4 my-1 font-semibold ">Recio</div>
                    <div className="flex gap-6 text-xl items-center mr-12 font-semibold text-blue-100">
                        <div>Home</div>
                        <div>Features</div>
                        <div>Pricing</div>
                        <div>Testimonials</div>
                    </div>
                </div>
            </div>
            
        </div>
    )
}