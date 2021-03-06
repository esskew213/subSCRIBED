import React, { useState } from 'react';
import useInputState from '../hooks/setInputState';
import {
	Typography,
	Divider,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Button,
	InputAdornment,
	Box,
	FormLabel
} from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import TableDatePicker from './TableDatePicker';
import { useContext } from 'react';
import axios from 'axios';
import applyCaseMiddleware from 'axios-case-converter';
import { SubscriptionsContext } from '../context/Subscriptions.context';
const NewSubscriptionForm = ({ handleCloseModal = null, subscription = null }) => {
	const { getSubscriptions } = useContext(SubscriptionsContext);

	// using a custom hook for all input fields EXCEPT date, which uses react date picker
	const [ name, handleNameChange, resetName ] = useInputState(subscription ? subscription.name : '');
	const [ price, handlePriceChange, resetPrice ] = useInputState(subscription ? subscription.priceInDollars : '');
	const [ recurs, handleRecursChange, resetRecurs ] = useInputState(subscription ? subscription.recurs : 'NEVER');
	const [ startDate, setStartDate ] = useState(subscription ? new Date(subscription.dateStarted) : new Date());
	const handleStartDateChange = (date) => {
		setStartDate(date);
	};

	const handleSubmit = async (evt) => {
		evt.preventDefault();
		const dateStarted = startDate.toISOString().split('T')[0];
		console.log(dateStarted);
		const priceInDollars = parseFloat(price).toFixed(2);
		const newSubscription = { dateStarted, name, priceInDollars, recurs };

		// using middleware to convert from camel case in javascript to snake case in python
		const client = applyCaseMiddleware(axios.create());
		if (subscription) {
			newSubscription.id = subscription.id;
			console.log(newSubscription);
			await client.post('http://127.0.0.1:8000/edit_subscription', newSubscription, {
				headers: { authorization: localStorage.token }
			});
		} else {
			// sending in as a list in case there is more than one subscription
			await client.post(
				'http://127.0.0.1:8000/add_subscriptions',
				{ subscriptions: [ newSubscription ] },
				{
					headers: { authorization: localStorage.token }
				}
			);
		}
		await getSubscriptions();

		setStartDate(new Date());
		resetPrice();
		resetName();
		resetRecurs();
		if (handleCloseModal) {
			handleCloseModal();
		}
	};
	return (
		<form onSubmit={handleSubmit}>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'flex-start',
					flexWrap: 'wrap',
					width: '40vw',
					maxWidth: '500px'
				}}
			>
				<Typography
					sx={{ color: 'primary.dark', fontSize: '1.1rem', alignSelf: 'center' }}
					gutterBottom
					variant="button"
					component="h6"
				>
					{subscription ? 'Edit subscription' : 'Add a subscription'}
				</Typography>
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'row',
						flexWrap: 'wrap',
						justifyContent: 'space-between',
						mb: '10px',
						width: '100%'
					}}
				>
					<FormControl sx={{ maxWidth: '200px' }} variant="standard" margin="dense" required>
						<TextField
							variant="standard"
							size="small"
							label="Subscription name"
							type="text"
							value={name}
							onChange={handleNameChange}
							required
							autoFocus
							placeholder="e.g. cold brew coffee"
							sx={{ minWidth: '100px' }}
						/>
					</FormControl>
					<FormControl variant="standard" margin="dense" sx={{ maxWidth: '200px' }} required>
						<TextField
							variant="standard"
							size="small"
							id="price"
							label="Price"
							type="number"
							value={price}
							onChange={handlePriceChange}
							min="0"
							required
							placeholder="0.00"
							step="0.01"
							InputProps={{
								startAdornment: <InputAdornment position="start">$</InputAdornment>,
								inputProps: { min: 0, step: 0.01 }
							}}
							sx={{ width: '100px' }}
						/>
					</FormControl>
				</Box>
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'row',
						flexWrap: 'wrap',
						justifyContent: 'space-between',
						alignItems: 'flex-end',
						mb: '10px',
						width: '100%'
					}}
				>
					<FormControl variant="standard" margin="dense" required sx={{ minWidth: '100px' }}>
						<InputLabel htmlFor="recurs">Recurs</InputLabel>
						<Select id="recurs" margin="dense" value={recurs} onChange={handleRecursChange} label="Recurs">
							<MenuItem value="NEVER">Never</MenuItem>
							<MenuItem value={'WEEKLY'}>Weekly</MenuItem>
							<MenuItem value={'MONTHLY'}>Monthly</MenuItem>
							<MenuItem value={'YEARLY'}>Yearly</MenuItem>
						</Select>
					</FormControl>

					<FormControl variant="standard" margin="dense" required sx={{ minWidth: '100px' }}>
						<FormLabel sx={{ fontSize: '0.8rem', mb: '5px' }}>Start date</FormLabel>
						<TableDatePicker id="start-date" date={startDate} onInputChange={handleStartDateChange} />
					</FormControl>
				</Box>
			</Box>
			<Divider />
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'baseline',
					justifyContent: 'flex-end',
					flexWrap: 'wrap'
				}}
			>
				<Button
					size="small"
					type="submit"
					color="success"
					variant="contained"
					sx={{ mt: '15px' }}
					endIcon={<DoneIcon />}
				>
					SUBMIT
				</Button>
			</Box>
		</form>
	);
};

export default NewSubscriptionForm;
