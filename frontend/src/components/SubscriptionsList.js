import React, { useState, useContext, useEffect } from 'react';
import SubscriptionItem from './SubscriptionItem';
import { Grid, Box, Button, Typography, Select, FormControl, InputLabel, MenuItem } from '@mui/material';
import { SubscriptionsContext } from '../context/Subscriptions.context';
import { sortByBillingDate, sortByName, sortByPrice, sortByDateStarted } from '../utils/sortFunctions';
import SortIcon from '@mui/icons-material/Sort';
const SubscriptionsList = () => {
	const { subscriptions, getSubscriptions } = useContext(SubscriptionsContext);
	const [ displayedSubs, setDisplayedSubs ] = useState('');

	console.log(displayedSubs);
	useEffect(() => {
		getSubscriptions();
	}, []);

	useEffect(
		() => {
			if (subscriptions) {
				console.log(subscriptions);
				const subscriptions_copy = JSON.parse(JSON.stringify(subscriptions));
				setDisplayedSubs(subscriptions_copy);
			}
		},
		[ subscriptions ]
	);
	const toDisplay = displayedSubs ? displayedSubs : subscriptions;

	const handleSortByChange = (evt) => {
		const sortBy = evt.target.value;
		const displayedSubsCopy = JSON.parse(JSON.stringify(displayedSubs));
		switch (sortBy) {
			case 'NEXTBILLINGDATE':
				setDisplayedSubs(sortByBillingDate(displayedSubsCopy));
				break;
			case 'NAME':
				setDisplayedSubs(sortByName(displayedSubsCopy));
				break;
			case 'COST':
				setDisplayedSubs(sortByPrice(displayedSubsCopy));
				break;
			case 'STARTDATE':
				setDisplayedSubs(sortByDateStarted(displayedSubsCopy));
				break;
			default:
				throw new Error();
		}
	};
	return (
		<React.Fragment>
			{toDisplay.length > 0 ? (
				<Box sx={{ width: '60vw', maxWidth: '500px' }}>
					<Grid container rowSpacing={2} direction="column" justifyContent="flex-start" alignItems="center">
						<Grid item sx={{ alignSelf: 'flex-end' }}>
							<FormControl variant="filled" margin="dense" size="small" sx={{ minWidth: '100px' }}>
								<InputLabel htmlFor="sort-by" shrink>
									Sort by
								</InputLabel>
								<Select
									id="sort-by"
									margin="dense"
									defaultValue="NEXTBILLINGDATE"
									onChange={handleSortByChange}
									label="Sort by"
								>
									<MenuItem value="NEXTBILLINGDATE">Next billing date</MenuItem>
									<MenuItem value="NAME">Name</MenuItem>
									<MenuItem value="STARTDATE">Start date</MenuItem>
									<MenuItem value="COST">Cost</MenuItem>
								</Select>
							</FormControl>
						</Grid>
						{toDisplay.map((subscription, idx) => (
							<Grid item xl={8} lg={8} md={8} sm={8} xs={12} key={idx}>
								<SubscriptionItem subscription={subscription} />
							</Grid>
						))}
					</Grid>
				</Box>
			) : (
				<Box sx={{ textAlign: 'center', p: '30px' }}>
					<Typography variant="h5">No subscriptions found.</Typography>
				</Box>
			)}
		</React.Fragment>
	);
};

export default SubscriptionsList;
