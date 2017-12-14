<!--
	STORY
-->

<template>

	<div :data-item-id="articleId" :class="{ 'story': true, 'full-fat': isFullFat }">
		<div v-if="isFullFat" class="cell title">
			<div class="inner">{{ title }}</div>
		</div>

		<div v-if="isFullFat" class="cell date-time">
			<div class="inner">{{ time }}, {{date}}</div>
		</div>

		<div v-if="isFullFat" class="cell actions">
			<div class="inner">
				<div :class="{ 'tag': true, 'on': published }">
					<span v-if="published">Published</span>
					<span v-if="!published">Offline</span>
				</div>
				<a href="JavaScript:void(0);" v-if="published" @click="setArticleUnpublished(articleId)"><span >take offline</span></a>
				<a href="JavaScript:void(0);" v-if="!published" @click="setArticlePublished(articleId)"><span>publish</span></a>
			</div>
		</div>
	</div>

</template>

<script>

	import { getSocket } from '../../../scripts/webSocketClient';

	export default {
		props: [`articleId`, `isFullFat`, `title`, `time`, `date`, `published`],
		methods: {

			setArticlePublished (articleId) {

				this.$store.commit(`update-article`, {
					key: articleId,
					dataField: `published`,
					dataValue: true,
				});

				getSocket().emit(
					`stories/set-story-published`,
					{ articleId, published: true },
					data => (!data || !data.success ? alert(`There was a problem publishing the story.`) : void (0))
				);

			},

			setArticleUnpublished (articleId) {

				this.$store.commit(`update-article`, {
					key: articleId,
					dataField: `published`,
					dataValue: false,
				});

				getSocket().emit(
					`stories/set-story-published`,
					{ articleId, published: false },
					data => (!data || !data.success ? alert(`There was a problem unpublishing the story.`) : void (0))
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
				width: 14.00rem;
				@include user-select-off();

				>.inner {
					margin-left: 0;

					a {
						margin-left: 0.50rem;
						color: $faded-color;
						text-decoration: none;
					}
				}
			}
		}
	}

</style>
