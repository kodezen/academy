import React, { useState, useRef, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import Button from '@Components/Button';
import { getAddonActiveStatus } from '@Utils/helper';
import { useSelector } from 'react-redux';

const ImageEditorCanvas = ({
	selectedImage,
	setSelectedImage,
	setMaskedImage,
	handlerAppend,
}) => {
	const allAddons = useSelector((state) => state.addons);
	const canvasRef = useRef(null);
	const [brushSize, setBrushSize] = useState(30);
	const [isErasing, setIsErasing] = useState(false);
	const [isDrawing, setIsDrawing] = useState(false);
	const [history, setHistory] = useState([]);
	const ctxRef = useRef(null);
	const imgRef = useRef(new Image());

	const CANVAS_WIDTH = 700;
	const CANVAS_HEIGHT = 600;

	useEffect(() => {
		if (!selectedImage) return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');
		ctxRef.current = ctx;

		const img = new Image();
		img.onload = () => {
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
			saveStateToHistory();
		};
		img.src = selectedImage;
		imgRef.current = img;
	}, [selectedImage]);

	const saveStateToHistory = () => {
		const canvas = canvasRef.current;
		const data = ctxRef.current.getImageData(
			0,
			0,
			canvas.width,
			canvas.height
		);
		setHistory((prev) => [...prev, data]);
	};

	const erase = (e) => {
		const canvas = canvasRef.current;
		const ctx = ctxRef.current;
		const rect = canvas.getBoundingClientRect();
		const scaleX = canvas.width / rect.width;
		const scaleY = canvas.height / rect.height;

		const x = (e.clientX - rect.left) * scaleX;
		const y = (e.clientY - rect.top) * scaleY;

		ctx.save();
		ctx.globalCompositeOperation = 'destination-out';
		ctx.beginPath();
		ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	};

	const handleMouseDown = (e) => {
		if (isErasing) {
			saveStateToHistory();
			erase(e);
			setIsDrawing(true);
		}
	};

	const handleMouseMove = (e) => {
		if (isErasing && isDrawing) {
			erase(e);
		}
	};

	const handleMouseUp = () => {
		if (isErasing) {
			setIsDrawing(false);
			const canvas = canvasRef.current;
			const dataURL = canvas.toDataURL('image/png');
			setMaskedImage(dataURL);
		}
	};

	const toggleEraser = () => {
		setIsErasing((prev) => !prev);
	};

	const exportImage = () => {
		const canvas = canvasRef.current;
		const dataURL = canvas.toDataURL('image/png');
		const link = document.createElement('a');
		link.href = dataURL;
		link.download = 'edited_image.png';
		link.click();
	};

	const handleUndo = () => {
		if (history.length === 0) return;
		const canvas = canvasRef.current;
		const ctx = ctxRef.current;
		const lastState = history[history.length - 1];
		ctx.putImageData(lastState, 0, 0);
		setHistory((prev) => prev.slice(0, -1));
	};

	return (
		<div className="academy-ai-image__generator">
			{getAddonActiveStatus(allAddons, 'chatgpt') && (
				<Button
					icon={
						<span className="academy-icon academy-icon--angle-left" />
					}
					onClick={() => setSelectedImage(false)}
					suffix="ai-go-back"
				/>
			)}

			<div className="academy-warning-text">
				<span className="academy-icon academy-icon--information" />
				<p>
					{__(
						'Effortlessly edit images by selecting entire areas to remove or replace with new elements.',
						'academy'
					)}
				</p>
			</div>

			<canvas
				ref={canvasRef}
				width={CANVAS_WIDTH}
				height={CANVAS_HEIGHT}
				style={{
					border: '1px solid black',
					cursor: isErasing ? 'pointer' : 'default',
					background:
						'repeating-conic-gradient(#ccc 0% 25%, #eee 0% 50%) 0% / 20px 20px',
				}}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseUp}
				onDoubleClick={toggleEraser}
			/>

			<div className="academy-ai-iamage__footer academy-flex academy-mt-4">
				<div className="academy-item-center academy-flex-g-3">
					<label htmlFor="brushSize">Brush Size: </label>
					<input
						type="range"
						id="brushSize"
						min="5"
						max="100"
						value={brushSize}
						onChange={(e) => setBrushSize(Number(e.target.value))}
						style={{ width: '50px' }}
					/>
				</div>
				<div className="academy-item-center academy-flex-g-3">
					<Button
						preset="transparent"
						border="purple"
						label={__('Export Image', 'academy')}
						onClick={exportImage}
					/>
					<Button
						preset="transparent"
						border="purple"
						label={__('Undo', 'academy')}
						onClick={handleUndo}
					/>
				</div>
			</div>
		</div>
	);
};

export default ImageEditorCanvas;
