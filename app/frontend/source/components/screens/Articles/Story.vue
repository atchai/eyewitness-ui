<!--
	SCREEN: ARTICLES
-->

<template>

	<div class="story">
		<div class="cell title">
			<div class="inner">{{ title }}</div>
		</div>

		<div class="cell date-time">
			<div class="inner">{{ time }}, {{date}}</div>
		</div>

		<div class="cell actions">
			<div class="inner">
				<div :class="{ tag: true, on: published }">
					<span v-if="published">Published</span>
					<span v-if="!published">Offline</span>
				</div>
				<a href="JavaScript:void(0);">
					<span v-if="published">take offline</span>
					<span v-if="!published">publish</span>
				</a>
			</div>
		</div>
	</div>

</template>

<script>

	export default {
		props: [`title`, `time`, `date`, `published`],
		data: function () {
			return {

			};
		},
	};

</script>

<style lang="scss" scoped>

	.story {
		display: flex;
		align-items: stretch;
		height: 3.50rem;
		box-shadow: 1px 1px 5px $panel-shadow-color;
		margin-bottom: 2.00rem;

		>.cell {
			display: flex;
			flex-direction: row;
			align-items: center;
			padding: 0 0.75rem;

			>.inner {
				display: inline-block;
				margin: auto;
				white-space: nowrap;
				text-overflow: ellipsis;
				overflow: hidden;
			}

			&.title {
				flex: 1;
				min-width: 0;
				padding-right: 0;
			}

			&.date-time {
				flex-shrink: 0;
				width: 8.00rem;
				color: #9B9B9B;
				border-right: 1px solid $panel-border-color;

				>.inner {
					margin-right: 0;
				}
			}

			&.actions {
				flex-shrink: 0;
				width: 12.00rem;
				@include user-select-off();

				>.inner {
					margin-left: 0;

					a {
						margin-left: 0.50rem;
						color: #9B9B9B;
						text-decoration: none;
					}
				}
			}
		}
	}

</style>
