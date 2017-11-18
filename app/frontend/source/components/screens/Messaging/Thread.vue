<!--
	THREAD
-->

<template>

	<div :class="{ thread: true, unread: unread }">
		<div class="image"><img src="imageUrl"></div>
		<div class="meta">
			<div class="details">
				<div class="name">{{ name }}</div>
				<div class="date">{{ date }}</div>
			</div>
			<div class="message">{{ message }}</div>
		</div>
	</div>

</template>

<script>

	export default {
		props: [`imageUrl`, `name`, `date`, `message`, `unread`],
	};

</script>

<style lang="scss" scoped>

	.thread {
		display: flex;
		flex-direction: row;
		height: 4.50rem;
		padding: 0 0.50rem;
		border-bottom: 1px solid $panel-border-color;

		>.image {
			display: flex;
			flex-shrink: 0;
			width: 3.50rem;
			margin-right: 0.50rem;

			img {
				display: block;
				margin: auto;
				width: 3.00rem;
				height: 3.00rem;
				border-radius: 50%;
				overflow: hidden;
			}
		}

		>.meta {
			display: flex;
			flex-direction: column;
			flex: 1;
			margin: 0.35rem 0;
			font-size: 0.80rem;

			>.details {
				display: flex;
				flex-direction: row;
				flex-shrink: 0;
				height: 1.25rem;

				>.name {
					flex: 1;
					font-weight: bold;
				}

				>.date {
					flex-shrink: 0;
					width: 3.00rem;
					color: $faded-color;
					text-align: right;
				}
			}

			>.message {
				flex: 1;
				min-height: 0;
				color: $panel-grey-text;
				overflow: hidden;
			}
		}
	}

</style>
