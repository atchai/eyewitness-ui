<!--
	THREAD
-->

<template>

	<router-link :to="`/messaging/thread/${itemId}`" :data-item-id="itemId" :class="{ 'thread': true, 'unread': unread }">
		<div class="image" v-if="isFullFat">
			<div class="image-circle" style="`background-image: url('${imageUrl}')`"></div>
		</div>
		<div class="meta" v-if="isFullFat">
			<div class="details">
				<div class="name">{{ userFullName }}</div>
				<div class="date">{{ date | formatDateAsRelative() }}</div>
			</div>
			<div class="message" v-if="isFullFat">
				<div class="text">{{ message }}</div>
				<div class="unread-container"><div class="orb"></div></div>
			</div>
		</div>
	</router-link>


</template>

<script>

	import moment from 'moment';

	export default {
		props: [`itemId`, `isFullFat`, `imageUrl`, `userFullName`, `date`, `message`, `adminLastReadMessages`],
		computed: {

			unread () {
				const adminLastReadMessages = moment(this.adminLastReadMessages);
				const lastMessage = moment(this.date);

				return adminLastReadMessages.isBefore(lastMessage);
			},

		},
	};

</script>

<style lang="scss" scoped>

	.thread {
		display: flex;
		flex-direction: row;
		height: 4.75rem;
		padding: 0 0.50rem;
		border-bottom: 1px solid $panel-border-color;
		background: $panel-background-color;
		text-decoration: none;
		color: inherit;
		cursor: pointer;

		&.thread-move {
			transition: transform 0.5s;
		}

		&.router-link-active {
			background: #D8D7D7;
		}

		&:hover {
			background: #E8E7E7;
		}

		&.unread {
			.unread-container {
				>.orb {
					visibility: visible !important;
				}
			}
		}

		>.image {
			display: flex;
			flex-shrink: 0;
			width: 3.50rem;
			margin-right: 0.50rem;

			>.image-circle {
				display: block;
				margin: auto;
				width: 3.00rem;
				height: 3.00rem;
				border-radius: 50%;
				background-color: #9B9B9B;
				background-size: cover;
				overflow: hidden;
			}
		}

		>.meta {
			display: flex;
			flex-direction: column;
			flex: 1;
			margin: 0.35rem 0;
			font-size: 0.80rem;
			min-width: 0;

			>.details {
				display: flex;
				flex-direction: row;
				flex-shrink: 0;
				height: 1.25rem;

				>.name {
					flex: 1;
					font-weight: bold;
					white-space: nowrap;
					text-overflow: ellipsis;
					overflow: hidden;
				}

				>.date {
					flex-shrink: 0;
					width: 7.00rem;
					color: $faded-color;
					text-align: right;
				}
			}

			>.message {
				display: flex;
				align-items: stretch;
				flex: 1;
				min-height: 0;

				>.text {
					flex: 1;
					color: $panel-grey-text;
					overflow: hidden;
				}

				>.unread-container {
					display: flex;
					width: 1.00rem;
					flex-shrink: 0;

					>.orb {
						width: 0.50rem;
						height: 0.50rem;
						border-radius: 50%;
						background: $blue-color;
						margin: auto;
						margin-right: 0;
						visibility: hidden;
					}
				}
			}
		}
	}

</style>
