<!--
	STORY
-->

<template>

	<div :data-item-id="itemId" :class="{ 'story': true, 'full-fat': isFullFat }">
		<div v-if="isFullFat" class="cell title">
			<div class="inner">{{ title }}</div>
		</div>

		<div v-if="isFullFat" class="cell date-time">
			<div class="inner">{{ time }}, {{date}}</div>
		</div>

		<div v-if="isFullFat" class="cell actions">
			<div class="inner">
				<a href="JavaScript:void(0);" @click="sendBreakingNewsAlert(itemId, priority)" :class="{ 'tag': true, 'priority': true, 'on': priority }">
					<span>Send Alert</span>
				</a>
				<a href="JavaScript:void(0);" @click="setArticlePublishedState(itemId, published)" :class="{ 'tag': true, 'published': true, 'on': published }">
					<span v-if="published">Unpublish</span>
					<span v-if="!published">Publish</span>
				</a>
			</div>
		</div>
	</div>

</template>

<script>

	import { getSocket } from '../../../scripts/webSocketClient';

	export default {
		props: [`itemId`, `isFullFat`, `title`, `time`, `date`, `published`, `priority`],
		methods: {

			sendBreakingNewsAlert (itemId, oldPriority) {

				// Do nothing if the story is already marked priority.
				if (oldPriority) { return; }

				this.$store.commit(`update-story`, {
					key: itemId,
					dataField: `priority`,
					dataValue: true,
				});

				getSocket().emit(
					`stories/set-story-priority`,
					{ itemId, priority: true },
					data => (!data || !data.success ? alert(`There was a problem sending the breaking news alert.`) : void (0))
				);

			},

			setArticlePublishedState (itemId, oldPublished) {

				const newPublished = !oldPublished;

				this.$store.commit(`update-story`, {
					key: itemId,
					dataField: `published`,
					dataValue: newPublished,
				});

				getSocket().emit(
					`stories/set-story-published`,
					{ itemId, published: newPublished },
					data => (!data || !data.success ? alert(`There was a problem setting the story's publish state.`) : void (0))
				);

			},

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
		opacity: 0.50;

		&.full-fat {
			opacity: 1;
		}

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

				>.inner {
					margin-left: 0;
				}
			}

			&.date-time {
				flex-shrink: 0;
				width: 9.50rem;
				color: #9B9B9B;
				border-right: 1px solid $panel-border-color;

				>.inner {
					margin-right: 0;
				}
			}

			&.actions {
				flex-shrink: 0;
				width: 16.00rem;
				@include user-select-off();

				>.inner {
					margin-left: 0;

					a {
						margin: 0 0.25rem;
						color: white;
						text-decoration: none;

						&.tag.priority {
							background: #4990E2;

							&.on {
								background: $tag-off-background-color;
								cursor: not-allowed;
								opacity: 1.00 !important;
							}
						}

						&.tag.published {
							background: $tag-on-background-color;

							&.on {
								background: #d6411e;
							}
						}
					}
				}
			}
		}
	}

</style>
