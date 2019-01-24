<!--
	STORY
-->

<template>

	<div :data-item-id="itemId" :class="{ 'story': true, 'full-fat': isFullFat }">
		<div class="inner">
			
			<div class="info">
				<div v-if="isFullFat" class="cell title">
					<div class="inner">{{ title }}</div>
				</div>

				<div v-if="isFullFat" class="cell date-time">
					<div class="inner">{{ time }}, {{date}}</div>
				</div>
			</div>

			<div v-if="isFullFat" class="cell actions">
				<div class="inner">
					<a href="JavaScript:void(0);" @click="showBreakingNewsDialog(itemId, title, priority, published)" :class="{ 'tag': true, 'priority': true, 'on': (priority || !published) }">
						<span>Send Alert</span>
					</a>
					<a href="JavaScript:void(0);" @click="setArticlePublishedState(itemId, published)" :class="{ 'tag': true, 'published': true, 'on': published }">
						<span v-if="published">Unpublish</span>
						<span v-if="!published">Publish</span>
					</a>
				</div>
			</div>

		</div>
	</div>

</template>

<script>

	import { getSocket } from '../../../scripts/webSocketClient';

	export default {
		props: [ `itemId`, `isFullFat`, `title`, `time`, `date`, `published`, `priority`, `showBreakingNewsDialog` ],
		methods: {

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
		background-color: white;

		&.full-fat {
			>.inner {
				opacity: 1;
			}
		}

		>.inner {
			display: flex;
			align-items: stretch;
			height: 3.50rem;
			border-bottom: 1px solid #E7E7E7;
			opacity: 0.50;
			align-items: center;
			justify-content: space-between;
			padding: 36px 10px;

			.info {
				display: flex;
				flex-direction: column;
				max-width: 600px;
			}

			.cell {
				display: flex;
				flex-direction: row;
				align-items: center;
				padding: 0 0.75rem;

				>.inner {
					display: inline-block;
					margin: 0;
					white-space: nowrap;
					text-overflow: ellipsis;
					overflow: hidden;
				}

				&.title {
					min-width: 0;
					padding-right: 0;
					font-size: 15px;
					color: #656565;
					letter-spacing: 0;
					text-align: left;

					>.inner {
						margin-left: 0;
					}
				}

				&.date-time {
					flex-shrink: 0;
					margin-top: 3px;
					margin-right: 0;
					opacity: 0.6;
					font-size: 14px;
					color: #656565;

					>.inner {
						margin-right: 0;
					}
				}

				&.actions {
					@include user-select-off();

					>.inner {
						margin-left: 0;

						a {
							margin: 0 0.25rem;
							color: white;
							text-decoration: none;

							&.tag {
								text-transform: capitalize;
								min-width: 112px;
								text-align: center;
							}

							&.tag.priority {
								background: transparent;
								border: 1px solid $brand-main-color;
								color: $brand-main-color;
								width: auto;
								height: auto;
								line-height: normal;
								padding: 0.40rem 1.2rem;
								border-radius: 20px;
								transition: all ease-in-out 200ms;

								&:hover {
									background-color: lighten($brand-main-color, 60%);
									opacity: 1;
								}

								&.on {
									background: #E4E4E4;
									cursor: not-allowed;
									opacity: 1.00 !important;
									border: none;
									color: #9a9a9a;

									&:hover {
										background-color: #E4E4E4;
									}
								}
							}

							&.tag.published {
								background: transparent;
								border: 1px solid #498F43;
								color: #498F43;
								width: auto;
								height: auto;
								line-height: normal;
								padding: 0.40rem 1.2rem;
								border-radius: 20px;
								transition: all ease-in-out 200ms;

								&:hover {
									background-color: lighten(#498F43, 50%);
									opacity: 1;
								}

								&.on {
									background: transparent;
									border-color: #D0021B;
									color: #D0021B;

									&:hover {
										background-color: rgba(197, 2, 26, 0.07);
										opacity: 1;
									}
								}
							}
						}
					}
				}
			}
		}
	}

</style>
