import React, {useEffect, useState} from 'react';
import ParticleSimulator from './Components/ParticleSimulator';
import './App.scss';

const App: React.FC = () => {
	const [isLoaded, setIsLoaded] = useState(false);
	const divRef = React.useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (divRef.current) {
			setIsLoaded(true);
		}
	}, [divRef]);

	return (
		<div className='App'>
			<div ref={divRef}>
				{isLoaded ? (
					<div className={'particle-sim-canvas'}>
						<ParticleSimulator
							parentRef={divRef}
							// initColor={[0xFF, 0x4C, 0x19, 0x80]}
							// finalColor={[0xFF, 0xFF, 0xFF, 0xFF]}
						/>
					</div>
				) : (
					<p className={'wait-sim-canvas'}>Loading...</p>
				)}
			</div>
		</div>
	);
};

export default App;
